/**
 * Token刷新接口
 */

import { createSuccessResponse, createAuthErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 刷新Token请求验证schema
const refreshSchema = z.object({
  refreshToken: z.string().min(1, '刷新Token不能为空')
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10 // 刷新接口限制适中
  })(req);

  try {
    const body = await req.request.json();
    const validatedData = refreshSchema.parse(body);
    
    // 验证Refresh Token
    const decoded = verifyRefreshToken(validatedData.refreshToken);
    if (!decoded) {
      const response = createAuthErrorResponse(
        'TOKEN_INVALID',
        '刷新Token无效或已过期'
      );
      setCorsHeaders(response);
      return response;
    }
    
    // 检查Token版本（用于撤销功能）
    // TODO: 从数据库检查Token版本是否匹配
    
    // 生成新的Token对
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      username: 'user', // 这里需要从数据库获取用户名
      roles: ['user'] // 这里需要从数据库获取角色
    });
    
    const newRefreshToken = generateRefreshToken(decoded.userId, decoded.tokenVersion + 1);
    
    // TODO: 更新数据库中的Token版本
    
    const response = createSuccessResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createAuthErrorResponse(
        'VALIDATION_ERROR',
        '刷新Token数据验证失败',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
