/**
 * 获取用户收藏的军队列表
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';
 

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50 // 收藏列表接口限制适中
  })(req);
 
  try {
    // 验证用户身份
    const user = requireAuth(req);

    // 通过 ArmyAPI 获取收藏军队（App 端自行分页，不在服务端分页）
    const armies = await req.locals.server.army.getSavedArmies(req, { username: user.username });

    const response = createSuccessResponse({
      data: armies,
      total: armies.length
    }, '获取收藏军队成功');

    setCorsHeaders(response);
    return response;

  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
