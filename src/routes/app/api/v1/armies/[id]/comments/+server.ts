/**
 * 军队评论接口
 */

import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '$lib/app/utils/response';
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

// 移除分页参数，因为评论数据量通常不大

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
    
    // 获取军队信息（包含评论）
    const army = await req.locals.server.army.getArmy(req, armyId);
    if (!army) {
      const response = createErrorResponse('ARMY_NOT_FOUND', '军队不存在');
      setCorsHeaders(response);
      return response;
    }
    
    // 直接返回所有评论，不进行分页
    const comments = army.comments || [];
    
    const response = createSuccessResponse({
      data: comments,
      total: comments.length
    }, '获取评论成功');
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
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
      commentId: commentId,
      userId: user.userId
    }, '评论删除成功');
    
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
      commentId: commentId,
      armyId: armyId,
      userId: user.userId,
      comment: validatedData.comment,
      replyTo: validatedData.replyTo || null
    }, '评论发表成功');
    
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
