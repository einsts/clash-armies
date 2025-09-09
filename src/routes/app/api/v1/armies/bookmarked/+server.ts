/**
 * 获取用户收藏的军队列表
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 查询参数验证schema - 移除分页参数，保持与前端一致
const querySchema = z.object({
  sort: z.enum(['new', 'score']).default('new'),
});

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50 // 收藏列表接口限制适中
  })(req);

  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    const url = new URL(req.request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validatedParams = querySchema.parse(queryParams);


    
    // 获取用户收藏的军队
    // 直接使用用户ID查询，避免username不匹配的问题
    const savedArmyIds = await req.locals.server.db.query<{ armyId: number }>(`
      SELECT sa.armyId
      FROM saved_armies sa
      WHERE sa.userId = ?
    `, [user.userId]);
    
    const savedArmyIdsArr = savedArmyIds.map((row) => row.armyId);
    
    if (!savedArmyIdsArr.length) {
      // 如果没有收藏记录，返回空列表
      const response = createSuccessResponse({
        message: '获取收藏军队成功',
        data: {
          armies: [],
          total: 0
        }
      });
      setCorsHeaders(response);
      return response;
    }
    
    // 使用军队ID获取完整的军队信息
    const savedArmies = await req.locals.server.army.getArmies(req, { ids: savedArmyIdsArr });

    // 直接返回原始数据，不进行分页，保持与前端一致
    const response = createSuccessResponse({
      message: '获取收藏军队成功',
      data: {
        armies: savedArmies,
        total: savedArmies.length
      }
    });

    setCorsHeaders(response);
    return response;

  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createErrorResponse(
        'VALIDATION_ERROR',
        '查询参数验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }

    throw error; // 让错误处理中间件处理
  }
});
