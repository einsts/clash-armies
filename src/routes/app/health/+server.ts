/**
 * APP健康检查接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import type { RequestEvent } from '@sveltejs/kit';

// 移除无用的动态导入，避免未使用代码

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  try {
    // 获取限流状态（仅开发环境）
    let rateLimitInfo = null;
    if (process.env.NODE_ENV === 'development') {
      rateLimitInfo = {
        message: '限流状态查询功能已启用',
        note: '当前为开发环境，使用内存存储',
        storage: 'Node.js 进程内存',
        cleanup: '每小时自动清理过期记录'
      };
    }

    const response = createSuccessResponse({
      status: 'healthy',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.APP_VERSION || process.env.npm_package_version || 'unknown',
      rateLimit: rateLimitInfo
    }, 'APP服务正常运行');
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
