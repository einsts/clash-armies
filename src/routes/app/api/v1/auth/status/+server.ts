/**
 * 用户登录状态检查接口 - 与Web端保持一致
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { jwtAuthMiddleware } from '$lib/app/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 状态检查请求验证schema
const statusCheckSchema = z.object({
  action: z.enum(['refresh_status']).optional()
});

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100 // 状态检查可以频繁调用
  })(req);

  try {
    // 检查用户是否已经登录（通过JWT Token）
    const user = jwtAuthMiddleware(req);
    
    if (user) {
      // 用户已登录
      const response = createSuccessResponse({
        isLoggedIn: true,
        user: {
          id: user.userId,
          username: user.username,
          roles: user.roles,
          // 其他用户信息需要从数据库获取
        },
        loginMethod: 'google_oauth',
        lastLogin: new Date().toISOString(), // 需要从数据库获取实际值
        sessionValid: true
      });
      
      setCorsHeaders(response);
      return response;
    }
    
    // 用户未登录
    const response = createSuccessResponse({
      isLoggedIn: false,
      loginMethod: null,
      sessionValid: false,
      nextStep: 'call_login_endpoint'
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error: unknown) {
    throw error; // 让错误处理中间件处理错误
  }
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50
  })(req);

  try {
    const body = await req.request.json();
    const validatedData = statusCheckSchema.parse(body);
    
    if (validatedData.action === 'refresh_status') {
      // 刷新状态检查
      const user = jwtAuthMiddleware(req);
      
      if (user) {
        const response = createSuccessResponse({
          isLoggedIn: true,
          user: {
            id: user.userId,
            username: user.username,
            roles: user.roles,
          },
          loginMethod: 'google_oauth',
          lastLogin: new Date().toISOString(), // 需要从数据库获取实际值
          sessionValid: true,
          message: '状态已刷新'
        });
        
        setCorsHeaders(response);
        return response;
      } else {
        const response = createSuccessResponse({
          isLoggedIn: false,
          loginMethod: null,
          sessionValid: false,
          nextStep: 'call_login_endpoint',
          message: '状态已刷新'
        });
        
        setCorsHeaders(response);
        return response;
      }
    }
    
    // 默认状态检查
    const user = jwtAuthMiddleware(req);
    
    if (user) {
      const response = createSuccessResponse({
        isLoggedIn: true,
        user: {
          id: user.userId,
          username: user.username,
          roles: user.roles,
        },
        loginMethod: 'google_oauth',
        lastLogin: new Date().toISOString(), // 需要从数据库获取实际值
        sessionValid: true
      });
      
      setCorsHeaders(response);
      return response;
    } else {
      const response = createSuccessResponse({
        isLoggedIn: false,
        loginMethod: null,
        sessionValid: false,
        nextStep: 'call_login_endpoint'
      });
      
      setCorsHeaders(response);
      return response;
    }
    
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const response = createErrorResponse(
        'VALIDATION_ERROR',
        '状态检查数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
