/**
 * 军队点赞接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';

import { createSuccessResponse } from '$lib/app/utils/response';
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
    maxRequests: 20 // 点赞接口限制适中
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
    
    // 直接复用现有 ArmyAPI.saveVote 来点赞军队
    await req.locals.server.army.saveVote(req, armyId, 1);
    
    const response = createSuccessResponse({
      message: '点赞成功',
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
    
    // 直接复用现有 ArmyAPI.saveVote 来取消点赞
    await req.locals.server.army.saveVote(req, armyId, 0);
    
    const response = createSuccessResponse({
      message: '取消点赞成功',
      armyId: armyId,
      userId: user.userId
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
