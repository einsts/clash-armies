/**
 * 游戏大本营数据接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50 // 游戏数据接口限制适中
  })(req);

  try {
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // 使用缓存的静态大本营数据
    const townHalls = req.locals.server.army.townHalls;
    
    const response = createSuccessResponse(townHalls, '获取大本营数据成功');
    response.headers.set('Cache-Control', 'public, max-age=86400, immutable');
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
