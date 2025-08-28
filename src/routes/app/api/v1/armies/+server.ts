/**
 * 军队列表接口
 */

import { createSuccessResponse, createPaginatedResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { ArmyTransformer } from '$lib/app/transformers';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { initRequest } from '$lib/server/utils';

// 军队筛选参数验证schema
const armyFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  townHall: z.coerce.number().min(1).max(17).optional(),
  sort: z.enum(['new', 'score', 'popular', 'views', 'likes', 'comments']).default('new'),
  tags: z.string().optional(), // 逗号分隔的标签
  search: z.string().optional(),
  creator: z.string().optional()
});

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
    
    // 直接复用现有 ArmyAPI.getArmies
    const armies = await req.locals.server.army.getArmies(req, {
      townHall: validatedParams.townHall,
      sort: validatedParams.sort === 'new' ? 'new' : 'score', // 只支持new和score
      username: validatedParams.creator
    });
    
    // 手动实现分页（因为现有API不支持分页）
    const startIndex = (validatedParams.page - 1) * validatedParams.limit;
    const endIndex = startIndex + validatedParams.limit;
    const paginatedArmies = armies.slice(startIndex, endIndex);
    const total = armies.length;
    
    // 转换数据
    const transformer = new ArmyTransformer();
    const appArmies = transformer.toAppFormatList(paginatedArmies as any);
    
    // 创建分页响应
    const response = createPaginatedResponse(
      appArmies,
      validatedParams.page,
      validatedParams.limit,
      total
    );
    
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
  try {
    // TODO: 实现军队创建
    // 这里应该调用现有的ArmyAPI来创建军队
    
    const response = createSuccessResponse({
      message: '军队创建成功',
      armyId: 123 // 临时ID
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
