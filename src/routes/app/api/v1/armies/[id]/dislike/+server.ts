/**
 * 军队反向点赞接口
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 20 // 反向点赞接口限制适中
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
    
    // 直接复用现有 ArmyAPI.saveVote 来反向点赞军队
    await req.locals.server.army.saveVote(req, { armyId, vote: -1 });
    
    const response = createSuccessResponse({
      message: '反向点赞成功',
      armyId: armyId,
      userId: user.userId,
      action: 'dislike'
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof Error) {
      const response = createErrorResponse(
        'DISLIKE_ERROR',
        error.message,
        { details: error.message }
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
    maxRequests: 20 // 取消反向点赞接口限制适中
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
    
    // 直接复用现有 ArmyAPI.saveVote 来取消反向点赞
    await req.locals.server.army.saveVote(req, { armyId, vote: 0 });
    
    const response = createSuccessResponse({
      message: '取消反向点赞成功',
      armyId: armyId,
      userId: user.userId,
      action: 'undislike'
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof Error) {
      const response = createErrorResponse(
        'UNDISLIKE_ERROR',
        error.message,
        { details: error.message }
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
