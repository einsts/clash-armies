/**
 * 健康检查接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import type { RequestEvent } from '@sveltejs/kit';

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  const response = createSuccessResponse({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
  
  // 设置CORS头
  setCorsHeaders(response);
  
  return response;
});
