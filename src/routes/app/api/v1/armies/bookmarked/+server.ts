/**
 * 获取用户收藏的军队列表
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { ArmyTransformer } from '$lib/app/transformers/ArmyTransformer';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 查询参数验证schema
const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
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
    const savedArmies = await req.locals.server.army.getSavedArmies(req, user.username);
    
    // 手动实现分页
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    const endIndex = startIndex + validatedParams.limit;
    const paginatedArmies = savedArmies.slice(startIndex, endIndex);
    const total = savedArmies.length;

    // 转换数据格式
    const transformer = new ArmyTransformer();
    const appArmies = transformer.toAppFormatList(paginatedArmies as any);

    // 创建分页响应
    const response = createSuccessResponse({
      message: '获取收藏军队成功',
      data: {
        armies: appArmies,
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total,
          totalPages: Math.ceil(total / validatedParams.limit),
          hasNext: endIndex < total,
          hasPrev: validatedParams.page > 1
        }
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
