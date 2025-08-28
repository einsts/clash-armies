/**
 * 军队收藏接口
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { initRequest } from '$lib/server/utils';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 20 // 收藏接口限制适中
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
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // TODO: 实现收藏功能
    // 这里需要添加收藏相关的数据库操作
    // 可以创建一个新的收藏表或者扩展现有的用户偏好表
    
    const response = createSuccessResponse({
      message: '收藏成功',
      armyId: armyId,
      userId: user.userId
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});

export const DELETE = createApiEndpoint(async (req: RequestEvent) => {
  try {
    // 验证用户身份
    const user = requireAuth(req);
    const armyId = parseInt(req.params.id!);
    
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // TODO: 实现取消收藏功能
    
    const response = createSuccessResponse({
      message: '取消收藏成功',
      armyId: armyId,
      userId: user.userId
    });
    
    setCorsHeaders(response);
    
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
