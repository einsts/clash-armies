/**
 * APP用户登录接口 - 重构版本
 * 支持Google ID Token直接验证登录
 */

import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import { verifyGoogleIdToken, extractUserInfoFromToken } from '$lib/app/utils/googleAuth';
import { db } from '$server/db';
import { getUserRoles } from '$lib/app/server/users';
import { initRefreshState } from '$lib/app/server/refreshTokens';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import type { GoogleIdTokenLoginRequest } from '$lib/app/types/auth';

// 登录请求验证schema
const loginSchema = z.object({
  idToken: z.string().min(1, 'Google ID Token不能为空'),
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 应用限流中间件
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 10 // 登录接口限制
  })(req);

  try {
    const body = await req.request.json();
    const validatedData = loginSchema.parse(body) as GoogleIdTokenLoginRequest;
    
    // 验证Google ID Token
    const tokenPayload = await verifyGoogleIdToken(validatedData.idToken);
    const userInfo = extractUserInfoFromToken(tokenPayload);
    
    // 查找现有用户
    const existingUser = await db.getRow<{
      id: number;
      username: string;
      googleId: string;
      googleEmail: string;
      playerTag: string | null;
    }>('users', { googleId: userInfo.googleId });
    
    let userId: number;
    let username: string;
    let roles: string[];
    
    if (existingUser) {
      // 现有用户：更新邮箱信息（如果需要）
      userId = existingUser.id;
      username = existingUser.username;
      
      // 获取用户角色（复用函数）
      roles = await getUserRoles(existingUser.id);
      
      // 如果邮箱有变化，更新数据库
      if (existingUser.googleEmail !== userInfo.email) {
        await db.transaction(async (tx) => {
          await tx.query(`
            UPDATE users
            SET googleEmail = ?
            WHERE id = ?
          `, [userInfo.email, userId]);
        });
      }
    } else {
      // 新用户：创建用户账户
      const maxIdResult = await db.query<{ maxId: number }>('SELECT MAX(id) AS maxId FROM users');
      const maxId = maxIdResult[0]?.maxId || 0;
      username = `Warrior-${maxId + 1}`;
      
      // 创建用户和角色
      let newUserId: number | null = null;
      await db.transaction(async (tx) => {
        newUserId = await tx.insertOne('users', {
          username,
          googleId: userInfo.googleId,
          googleEmail: userInfo.email,
          playerTag: null,
        });
        await tx.insertOne('user_roles', { userId: newUserId, role: 'user' });
      });
      
      if (!newUserId) {
        throw new Error('Failed to create user');
      }
      
      userId = newUserId;
      roles = ['user'];
    }
    
    // 初始化用户 refresh token 状态并生成 jti
    const jti = crypto.randomUUID();
    await initRefreshState(userId, { initialVersion: 1, jti });

    // 生成APP端JWT Token（加入 jti）
    const accessToken = generateAccessToken({ userId, username, roles, jti });
    const refreshToken = generateRefreshToken(userId, 1, jti);
    
    // 返回登录成功响应
    const response = createSuccessResponse({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        username,
        roles,
        playerTag: existingUser?.playerTag || null,
        level: null, // TODO: 从游戏数据获取
        googleId: userInfo.googleId,
        googleEmail: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      },
      // APP 不依赖 Web cookie，移除 Lucia/sessionId
      expiresIn: {
        accessToken: 30 * 60, // 30分钟
        refreshToken: 30 * 24 * 60 * 60, // 30天
      }
    }, '登录成功');
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    setCorsHeaders(response, req);
    return response;
    
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const response = createErrorResponse(
        'VALIDATION_ERROR',
        '登录数据验证失败',
        error.errors
      );
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      setCorsHeaders(response, req);
      return response;
    }
    
    // 处理Google ID Token验证错误
    if (error instanceof Error && error.message.includes('Google ID Token verification failed')) {
      const response = createErrorResponse(
        'GOOGLE_AUTH_FAILED',
        'Google认证失败，请重新登录',
        { details: error.message }
      );
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      setCorsHeaders(response, req);
      return response;
    }
    const response = createErrorResponse('LOGIN_FAILED', '登录失败，请稍后重试');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    setCorsHeaders(response, req);
    return response;
  }
});

export const OPTIONS = async (req: RequestEvent) => {
  const response = new Response(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  setCorsHeaders(response);
  return response;
};


