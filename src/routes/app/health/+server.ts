/**
 * APP健康检查接口
 */

import { createSuccessResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import type { RequestEvent } from '@sveltejs/kit';

// 导入限流存储（仅开发环境）
let rateLimitStore: any = null;
if (process.env.NODE_ENV === 'development') {
  // 动态导入限流存储
  const rateLimitModule = await import('$lib/app/middleware/rateLimit');
  // 注意：这里需要访问内部的 rateLimitStore
}

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
      message: 'APP服务正常运行',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      rateLimit: rateLimitInfo
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    throw error; // 让错误处理中间件处理
  }
});
