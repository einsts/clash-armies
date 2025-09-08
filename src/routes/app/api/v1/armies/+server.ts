/**
 * 军队列表接口
 */

import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { ArmyTransformer } from '$lib/app/transformers';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 军队筛选参数验证schema - 只保留实际支持的参数
const armyFilterSchema = z.object({
  townHall: z.coerce.number().min(1).max(17).optional(),
  sort: z.enum(['new', 'score']).default('new'), // 只支持new和score
  creator: z.string().optional() // 对应ArmyAPI中的username参数
});

// 备份：原始GET接口（包含假分页和无用参数）
// export const GET_ORIGINAL = createApiEndpoint(async (req: RequestEvent) => {
//   // 应用限流中间件
//   rateLimitMiddleware({
//     windowMs: 15 * 60 * 1000, // 15分钟
//     maxRequests: 100 // 军队列表接口限制适中
//   })(req);

//   try {
//     // 解析查询参数
//     const url = new URL(req.request.url);
//     const queryParams = Object.fromEntries(url.searchParams.entries());
    
//     // 验证查询参数
//     const validatedParams = armyFilterSchema.parse(queryParams);
    
//     // req.locals.server 应该已经由 hooks.server.ts 初始化
    
//     // 直接复用现有 ArmyAPI.getArmies
//     const armies = await req.locals.server.army.getArmies(req, {
//       townHall: validatedParams.townHall,
//       sort: validatedParams.sort === 'new' ? 'new' : 'score', // 只支持new和score
//       username: validatedParams.creator
//     });
    
//     // 手动实现分页（因为现有API不支持分页）
//     const startIndex = (validatedParams.page - 1) * validatedParams.limit;
//     const endIndex = startIndex + validatedParams.limit;
//     const paginatedArmies = armies.slice(startIndex, endIndex);
//     const total = armies.length;
    
//     // 转换数据
//     const transformer = new ArmyTransformer();
//     const gameData = req.locals.server.army.gameData;
//     const appArmies = transformer.toAppFormatList(paginatedArmies as any, gameData);
    
//     // 创建分页响应
//     const response = createPaginatedResponse(
//       appArmies,
//       validatedParams.page,
//       validatedParams.limit,
//       total
//     );
    
//     setCorsHeaders(response);
//     return response;
    
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       const response = createValidationErrorResponse(
//         'VALIDATION_ERROR',
//         '查询参数验证失败',
//         error.errors
//       );
//       setCorsHeaders(response);
//       return response;
//     }
    
//     throw error; // 让错误处理中间件处理其他错误
//   }
// });

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100 // 军队列表接口限制适中
  })(req);

  try {
    // 解析查询参数
    const url = new URL(req.request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    // 验证查询参数
    const validatedParams = armyFilterSchema.parse(queryParams);
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // 直接复用现有 ArmyAPI.getArmies，获取所有匹配的军队数据
    const armies = await req.locals.server.army.getArmies(req, {
      townHall: validatedParams.townHall,
      sort: validatedParams.sort,
      username: validatedParams.creator
    });
    
    // 转换数据
    const transformer = new ArmyTransformer();
    const gameData = req.locals.server.army.gameData;
    const appArmies = transformer.toAppFormatList(armies as any, gameData);
    
    // 创建简单响应，不包含分页信息
    const response = createSuccessResponse({
      data: appArmies,
      total: appArmies.length
    });
    
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
    maxRequests: 10 // 创建军队接口限制较严格
  })(req);

  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    const body = await req.request.json();
    
    // 验证军队数据
    const armyData = {
      name: body.name,
      townHall: body.townHall,
      banner: body.banner,
      units: body.units || [],
      equipment: body.equipment || [],
      pets: body.pets || [],
      tags: body.tags || [],
      guide: body.guide
    };
    
    // 使用现有的军队系统保存军队
    const armyId = await req.locals.server.army.saveArmy(req, armyData);
    
    const response = createSuccessResponse({
      message: '军队创建成功',
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
        'ARMY_CREATION_ERROR',
        error.message,
        { details: error.message }
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
