/**
 * APP Google OAuth回调接口 - 与Web端保持一致
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import { OAuth2RequestError } from 'arctic';
import { google, lucia } from '$server/auth/lucia';
import { db } from '$server/db';
import type { RequestEvent } from '@sveltejs/kit';
import type { User } from '$types';

// 与Web端完全一致的GoogleUser类型
type GoogleUser = {
	sub: string;
	picture: string;
	email?: string;
	email_verified?: string;
};

// 与Web端完全一致的isObject函数
function isObject(obj: unknown): obj is Record<string, unknown> {
	return typeof obj === 'object' && !Array.isArray(obj) && obj !== null;
}

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10
  })(req);

  try {
    const body = await req.request.json();
    const { code } = body;
    
    if (!code) {
      const response = createErrorResponse(
        'INVALID_REQUEST',
        '缺少授权码'
      );
      setCorsHeaders(response);
      return response;
    }
    
    // 与Web端完全一致的Cookie获取逻辑
    const storedState = req.cookies.get('google_oauth_state') ?? null;
    const storedCodeVerifier = req.cookies.get('google_oauth_code_verifier') ?? null;
    
    if (!storedState || !storedCodeVerifier) {
      const response = createErrorResponse(
        'STATE_EXPIRED',
        'OAuth状态已过期，请重新发起登录'
      );
      setCorsHeaders(response);
      return response;
    }
    
    // 与Web端完全一致的状态解析逻辑
    let parsedState: unknown;
    let redirect: string | null = null;

    try {
      parsedState = JSON.parse(storedState);
    } catch (err) {
      // Pass - 与Web端完全一致
    }

    if (isObject(parsedState) && parsedState.r && typeof parsedState.r === 'string') {
      redirect = parsedState.r;
    }
    
    // 与Web端完全一致的授权码验证
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    
    // 与Web端完全一致的用户信息获取
    const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });
    
    const googleUser: GoogleUser = await response.json();
    const googleId = googleUser.sub;
    const googleEmail = googleUser.email;
    
    // 与Web端完全一致的用户查找逻辑
    const existingUser = await db.getRow<User>('users', { googleId });
    if (existingUser) {
      // 与Web端完全一致的现有用户更新逻辑
      if (googleEmail) {
        await db.transaction(async (tx) => {
          // prettier-ignore - 与Web端完全一致
          await tx.query(`
            UPDATE users
            SET googleEmail = ?
            WHERE id = ?
          `, [existingUser.id, googleUser.email ?? null])
        });
      }
      
      // 与Web端完全一致的会话创建逻辑
      const session = await lucia.createSession(existingUser.id, {});
      
      // APP端特有：生成JWT Token
      const accessToken = generateAccessToken({
        userId: existingUser.id,
        username: existingUser.username,
        roles: ['user'], // 从数据库获取实际角色
      });
      
      const refreshToken = generateRefreshToken(existingUser.id, 1);
      
      // 清理Cookie - 与Web端保持一致
      req.cookies.delete('google_oauth_state', { path: '/' });
      req.cookies.delete('google_oauth_code_verifier', { path: '/' });
      
      const response = createSuccessResponse({
        accessToken,
        refreshToken,
        user: {
          id: existingUser.id,
          username: existingUser.username,
          roles: ['user'],
          playerTag: existingUser.playerTag,
          level: null,
          googleId: existingUser.googleId,
          googleEmail: googleEmail // 使用从Google获取的邮箱
        },
        redirect: redirect || `/users/${existingUser.username}`
      });
      
      setCorsHeaders(response);
      return response;
      
    } else {
      // 与Web端完全一致的新用户创建逻辑
      // default username, user will be able to change this after (TODO: in the future allow user to set username on creation)
      const maxId = (await db.query<{ maxId: number }>('SELECT MAX(id) AS maxId FROM users'))[0].maxId;
      const username = `Warrior-${maxId + 1}`;

      let userId: number | null = null;
      await db.transaction(async (tx) => {
        userId = await tx.insertOne('users', {
          username,
          googleId,
          googleEmail,
        });
        await tx.insertOne('user_roles', { userId, role: 'user' });
      });
      
      if (!userId) {
        throw new Error('Expected user id'); // 与Web端完全一致
      }
      
      // 与Web端完全一致的会话创建逻辑
      const session = await lucia.createSession(userId, {});
      
      // APP端特有：生成JWT Token
      const accessToken = generateAccessToken({
        userId: userId,
        username: username,
        roles: ['user'],
      });
      
      const refreshToken = generateRefreshToken(userId, 1);
      
      // 清理Cookie - 与Web端保持一致
      req.cookies.delete('google_oauth_state', { path: '/' });
      req.cookies.delete('google_oauth_code_verifier', { path: '/' });
      
      const response = createSuccessResponse({
        accessToken,
        refreshToken,
        user: {
          id: userId,
          username: username,
          roles: ['user'],
          playerTag: null,
          level: null,
          googleId: googleId,
          googleEmail: googleEmail
        },
        redirect: redirect || `/users/${username}`
      });
      
      setCorsHeaders(response);
      return response;
    }
    
  } catch (error) {
    // 清理Cookie - 与Web端保持一致
    req.cookies.delete('google_oauth_state', { path: '/' });
    req.cookies.delete('google_oauth_code_verifier', { path: '/' });
    
    if (error instanceof OAuth2RequestError) {
      // invalid code - 与Web端完全一致
      const response = createErrorResponse(
        'GOOGLE_AUTH_FAILED',
        'Google OAuth认证失败'
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});
