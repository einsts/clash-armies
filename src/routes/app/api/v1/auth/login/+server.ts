/**
 * 用户登录接口
 */

import { createSuccessResponse, createAuthErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import { auth } from '$lib/server/auth/lucia';

// 登录请求验证schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空'),
  deviceName: z.string().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional().default('mobile')
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
    
    // req.locals.server 应该已经由 hooks.server.ts 初始化
    
    // 使用现有的Lucia认证系统
    const key = await auth.useKey('username', validatedData.username.toLowerCase(), validatedData.password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {}
    });
    
    // 获取用户信息
    const user = await auth.getUser(key.userId);
    
    // 生成JWT Token
    const accessToken = generateAccessToken({
      userId: user.userId,
      username: user.username,
      roles: user.roles || ['user']
    });
    
    const refreshToken = generateRefreshToken(user.userId, 1); // 版本1
    
    // 创建设备记录
    const deviceId = crypto.randomUUID();
    const device = {
      id: deviceId,
      userId: user.userId,
      deviceName: validatedData.deviceName || 'Unknown Device',
      deviceType: validatedData.deviceType,
      isActive: true,
      lastLoginAt: new Date(),
      createdAt: new Date()
    };
    
    // TODO: 保存设备信息到数据库
    
    const response = createSuccessResponse({
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        username: user.username,
        roles: user.roles || ['user'],
        playerTag: user.playerTag,
        level: user.level
      },
      device
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createAuthErrorResponse(
        'VALIDATION_ERROR',
        '登录数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    // Lucia认证错误处理
    if (error.message === 'AUTH_INVALID_KEY_ID' || error.message === 'AUTH_INVALID_PASSWORD') {
      const response = createAuthErrorResponse(
        'INVALID_CREDENTIALS',
        '用户名或密码错误'
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
