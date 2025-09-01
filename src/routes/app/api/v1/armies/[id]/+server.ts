/**
 * 军队详情接口
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { ArmyTransformer } from '$lib/app/transformers';
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
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10 // 军队更新接口限制较严格
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
    
    // 准备军队数据（包含ID用于更新）
    const armyData = {
      id: armyId,
      name: body.name,
      townHall: body.townHall,
      banner: body.banner,
      units: body.units || [],
      equipment: body.equipment || [],
      pets: body.pets || [],
      tags: body.tags || [],
      guide: body.guide
    };
    
    // 使用现有的军队系统更新军队
    await req.locals.server.army.saveArmy(req, armyData);
    
    const response = createSuccessResponse({
      message: '军队更新成功',
      armyId: armyId,
      userId: user.userId,
      army: {
        id: armyId,
        name: armyData.name,
        townHall: armyData.townHall,
        banner: armyData.banner
      }
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof Error) {
      const response = createErrorResponse(
        'ARMY_UPDATE_ERROR',
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
    maxRequests: 10 // 军队删除接口限制较严格
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
    
    // 使用现有的军队系统删除军队
    await req.locals.server.army.deleteArmy(req, armyId);
    
    const response = createSuccessResponse({
      message: '军队删除成功',
      armyId: armyId,
      userId: user.userId
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof Error) {
      const response = createErrorResponse(
        'ARMY_DELETE_ERROR',
        error.message,
        { details: error.message }
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
