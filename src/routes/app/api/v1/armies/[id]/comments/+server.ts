/**
 * 军队评论接口
 */

import { createSuccessResponse, createPaginatedResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { initRequest } from '$lib/server/utils';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 评论请求验证schema
const commentSchema = z.object({
  comment: z.string().min(1, '评论内容不能为空').max(1000, '评论内容不能超过1000字符'),
  replyTo: z.number().optional() // 回复的评论ID
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
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // TODO: 调用现有的CommentAPI获取评论列表
    // 这里应该复用现有的getComments方法
    // 暂时返回空数据，等CommentAPI实现后再连接
    
    const mockComments = []; // 临时使用空数组
    const total = 0; // 临时使用0
    
    // 创建分页响应
    const response = createPaginatedResponse(
      mockComments,
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
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // TODO: 调用现有的CommentAPI来发表评论
    // 这里应该复用现有的saveComment方法
    // 暂时返回成功，等CommentAPI实现后再连接
    
    const response = createSuccessResponse({
      message: '评论发表成功',
      commentId: 123, // 临时ID
      armyId: armyId,
      userId: user.userId
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
