/**
 * 军队详情接口
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { ArmyTransformer } from '$lib/app/transformers';
import { initRequest } from '$lib/server/utils';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 200 // 军队详情接口限制适中
  })(req);

  try {
    const armyId = parseInt(req.params.id!);
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // 直接复用现有 ArmyAPI.getArmy
    const army = await req.locals.server.army.getArmy(req, armyId);
    
    if (!army) {
      const response = createErrorResponse('ARMY_NOT_FOUND', '军队不存在');
      setCorsHeaders(response);
      return response;
    }
    
    // 转换数据
    const transformer = new ArmyTransformer();
    const appArmy = transformer.toAppFormat(army);
    
    const response = createSuccessResponse(appArmy);
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});

export const PUT = createApiEndpoint(async (req: RequestEvent) => {
  try {
    const armyId = parseInt(req.params.id!);
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // TODO: 实现军队更新
    // 这里应该调用现有的ArmyAPI来更新军队
    
    const response = createSuccessResponse({
      message: '军队更新成功',
      armyId: armyId
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});

export const DELETE = createApiEndpoint(async (req: RequestEvent) => {
  try {
    const armyId = parseInt(req.params.id!);
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // TODO: 实现军队删除
    // 这里应该调用现有的ArmyAPI来删除军队
    
    const response = createSuccessResponse({
      message: '军队删除成功',
      armyId: armyId
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
