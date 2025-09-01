/**
 * 军队评论接口
 */

import { createSuccessResponse, createPaginatedResponse, createErrorResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 评论请求验证schema
const commentSchema = z.object({
  comment: z.string().min(1, '评论内容不能为空').max(1000, '评论内容不能超过1000字符'),
  replyTo: z.number().nullable().optional() // 回复的评论ID，可以为null
});

// 评论筛选参数验证schema
const commentFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
});

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100 // 评论列表接口限制适中
  })(req);

  try {
    const armyId = parseInt(req.params.id!);
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }
    
    // 解析查询参数
    const url = new URL(req.request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // 验证查询参数
    const validatedParams = commentFilterSchema.parse(queryParams);
    
    // 获取军队信息（包含评论）
    const army = await req.locals.server.army.getArmy(req, armyId);
    if (!army) {
      const response = createErrorResponse('ARMY_NOT_FOUND', '军队不存在');
      setCorsHeaders(response);
      return response;
    }
    
    // 从军队数据中提取评论
    const comments = army.comments || [];
    const total = comments.length;
    
    // 手动实现分页
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    const endIndex = startIndex + validatedParams.limit;
    const paginatedComments = comments.slice(startIndex, endIndex);
    
    // 创建分页响应
    const response = createPaginatedResponse(
      paginatedComments,
      validatedParams.page,
      validatedParams.limit,
      total
    );
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createValidationErrorResponse(
        'VALIDATION_ERROR',
        '查询参数验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});

export const DELETE = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10 // 删除评论接口限制较严格
  })(req);

  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    // 从查询参数获取评论ID
    const url = new URL(req.request.url);
    const commentId = parseInt(url.searchParams.get('commentId') || '');
    
    if (isNaN(commentId)) {
      const response = createErrorResponse('INVALID_COMMENT_ID', '无效的评论ID');
      setCorsHeaders(response);
      return response;
    }
    
    // 使用现有的评论系统删除评论
    await req.locals.server.army.deleteComment(req, commentId);
    
    const response = createSuccessResponse({
      message: '评论删除成功',
      commentId: commentId,
      userId: user.userId
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理其他错误
  }
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10 // 发表评论接口限制较严格
  })(req);

  try {
    // 验证用户身份
    const user = requireAuth(req);
    const armyId = parseInt(req.params.id!);
    
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }
    
    const body = await req.request.json();
    const validatedData = commentSchema.parse(body);
    
    // 准备评论数据
    const commentData = {
      armyId: armyId,
      comment: validatedData.comment,
      replyTo: validatedData.replyTo || null
    };
    
    // 使用现有的评论系统保存评论
    const commentId = await req.locals.server.army.saveComment(req, commentData);
    
    const response = createSuccessResponse({
      message: '评论发表成功',
      commentId: commentId,
      armyId: armyId,
      userId: user.userId,
      comment: validatedData.comment,
      replyTo: validatedData.replyTo || null
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createValidationErrorResponse(
        'VALIDATION_ERROR',
        '评论数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
