/**
 * 统一游戏数据接口
 * 返回所有游戏静态数据，包括单位、装备、宠物、大本营等
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
    maxRequests: 100 // 统一接口可以稍微提高限制
  })(req);

  try {
    // 使用 ArmyAPI 的 gameData 方法获取所有静态游戏数据
    const gameData = req.locals.server.army.gameData;
    
    const response = createSuccessResponse(gameData, '获取游戏数据成功');
    // 缓存静态游戏数据 1 天
    response.headers.set('Cache-Control', 'public, max-age=86400, immutable');
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
