/**
 * APP Google OAuth初始化接口 - 与Web端保持一致
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { generateCodeVerifier } from 'arctic';
import { google } from '$server/auth/lucia';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10 // Google登录限制适中
  })(req);

  try {
    const body = await req.request.json();
    const { deviceName, deviceType } = body;
    
    // 与Web端保持完全一致的状态管理
    // 使用与Web端相同的重定向逻辑
    const redirectTo = '/app/auth/callback'; // APP端固定回调地址
    
    // 与Web端完全一致的状态格式
    const state = JSON.stringify({ r: redirectTo });
    const codeVerifier = generateCodeVerifier();
    
    // 与Web端完全一致的授权URL创建
    const url = await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ['email'], // 与Web端完全一致
    });
    
    // 与Web端完全一致的Cookie设置
    // 使用相同的Cookie名和配置
    req.cookies.set('google_oauth_state', state, {
      path: '/',
      secure: !dev,
      httpOnly: true,
      maxAge: 60 * 10, // 10 min - 与Web端完全一致
      sameSite: 'lax',
    });
    
    req.cookies.set('google_oauth_code_verifier', codeVerifier, {
      path: '/',
      secure: !dev,
      httpOnly: true,
      maxAge: 60 * 10, // 10 min - 与Web端完全一致
      sameSite: 'lax',
    });
    
    // 返回授权URL，APP端自己处理重定向
    const response = createSuccessResponse({
      authUrl: url.toString(),
      redirectTo,
      expiresIn: 600 // 10分钟
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    const response = createErrorResponse(
      'GOOGLE_AUTH_FAILED',
      'Google OAuth初始化失败'
    );
    setCorsHeaders(response);
    return response;
  }
});
