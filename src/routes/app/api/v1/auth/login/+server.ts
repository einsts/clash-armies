/**
 * 用户登录接口 - 与Web端保持一致
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { jwtAuthMiddleware } from '$lib/app/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 登录请求验证schema - 与Web端保持一致，不包含设备信息
const loginSchema = z.object({
  // 移除设备相关字段，与Web端保持一致
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5 // 登录接口限制更严格
  })(req);

  try {
    const body = await req.request.json();
    const validatedData = loginSchema.parse(body);
    
    // 检查用户是否已经登录（通过JWT Token）
    const user = jwtAuthMiddleware(req);
    
    if (user) {
      // 用户已经登录，返回用户信息和登录状态
      const response = createSuccessResponse({
        message: '用户已登录',
        isLoggedIn: true,
        user: {
          id: user.userId,
          username: user.username,
          roles: user.roles,
          // 其他用户信息需要从数据库获取
        },
        loginMethod: 'google_oauth'
      });
      
      setCorsHeaders(response);
      return response;
    }
    
    // 用户未登录，引导使用Google OAuth
    const response = createSuccessResponse({
      message: '请使用Google OAuth登录',
      isLoggedIn: false,
      googleOAuthUrl: '/app/api/v1/auth/google',
      instructions: [
        '1. 调用 POST /app/api/v1/auth/google 获取授权URL',
        '2. 在APP中打开授权URL',
        '3. 用户完成Google登录后，调用 POST /app/api/v1/auth/google/callback'
      ]
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const response = createErrorResponse(
        'VALIDATION_ERROR',
        '登录数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
