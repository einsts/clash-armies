/**
 * 军队投票接口（统一中间件 + 路径参数）
 */

import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

const voteSchema = z.object({
  vote: z.number().int().refine((v) => [-1, 0, 1].includes(v), 'vote 只能为 -1, 0, 1')
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 限流
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000,
    maxRequests: 50
  })(req);

  try {
    // 鉴权
    requireAuth(req);

    // 路径参数作为 armyId
    const armyId = parseInt(req.params.id!);
    if (isNaN(armyId)) {
      const response = createErrorResponse('INVALID_ARMY_ID', '无效的军队ID');
      setCorsHeaders(response);
      return response;
    }

    const body = await req.request.json();
    const { vote } = voteSchema.parse(body);

    await req.locals.server.army.saveVote(req, { armyId, vote });

    const response = createSuccessResponse({ message: '投票成功', armyId, vote });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createValidationErrorResponse('VALIDATION_ERROR', '投票数据验证失败', error.errors);
      setCorsHeaders(response);
      return response;
    }
    throw error;
  }
});
