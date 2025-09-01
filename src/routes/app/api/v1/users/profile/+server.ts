/**
 * 用户偏好设置接口
 */

import { createSuccessResponse, createErrorResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { requireAuth } from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 用户资料更新验证schema
const updateProfileSchema = z.object({
  username: z.string().trim().min(3, '用户名至少3个字符').max(30, '用户名最多30个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含英文字母、数字、下划线和连字符')
});

export const GET = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50 // 获取用户资料接口限制适中
  })(req);

  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    // 获取用户资料
    const userProfile = await req.locals.server.user.getUserById(req, user.userId);
    
    if (!userProfile) {
      const response = createErrorResponse('USER_NOT_FOUND', '用户不存在');
      setCorsHeaders(response);
      return response;
    }
    
    const response = createSuccessResponse({
      message: '获取用户资料成功',
      user: {
        id: userProfile.id,
        username: userProfile.username,
        playerTag: userProfile.playerTag,
        roles: userProfile.roles
      }
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof Error) {
      const response = createErrorResponse(
        'PROFILE_GET_ERROR',
        error.message,
        { details: error.message }
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});

export const PUT = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5 // 更新用户资料接口限制较严格
    })(req);

  try {
    // 验证用户身份
    const user = requireAuth(req);
    
    const body = await req.request.json();
    
    // 验证输入数据
    const validatedData = updateProfileSchema.parse(body);
    
    // 准备用户数据
    const userData = {
      id: user.userId,
      username: validatedData.username
    };
    
    // 使用现有的用户系统保存用户资料
    await req.locals.server.user.saveUser(req, userData);
    
    const response = createSuccessResponse({
      message: '用户资料更新成功',
      user: {
        id: user.userId,
        username: validatedData.username
      }
    });
    
    setCorsHeaders(response);
    
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createValidationErrorResponse(
        'VALIDATION_ERROR',
        '用户资料数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    if (error instanceof Error) {
      const response = createErrorResponse(
        'PROFILE_UPDATE_ERROR',
        error.message,
        { details: error.message }
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
