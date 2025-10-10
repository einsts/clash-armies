/**
 * APP 用户登录 - Apple
 * 接收 iOS 端传入的 authorizationCode，通过现有 arctic Apple 客户端换取 id_token，
 * 解析用户信息后完成用户创建/查找，并签发 APP 端 JWT（与 Google 登录保持一致）。
 */

import { z } from 'zod';
import type { RequestEvent } from '@sveltejs/kit';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { createSuccessResponse, createErrorResponse } from '$lib/app/utils/response';
import { generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import { db } from '$server/db';
import { getUserRoles } from '$lib/app/server/users';
import { initRefreshState } from '$lib/app/server/refreshTokens';
import { apple } from '$server/auth/lucia';

// 请求体校验：iOS 原生 Sign in with Apple 会提供 authorizationCode
const appleLoginSchema = z.object({
  authorizationCode: z.string().min(1, 'authorizationCode 不能为空'),
});

type AppleIdTokenPayload = {
  sub: string; // Apple 用户唯一ID
  email?: string;
};

function parseJwtPayload<T = unknown>(jwt: string): T {
  const payloadPart = jwt.split('.')[1] ?? '';
  const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const json = Buffer.from(padded, 'base64').toString('utf-8');
  return JSON.parse(json) as T;
}

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 限流
  rateLimitMiddleware({
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  })(req);

  try {
    const body = await req.request.json();
    const { authorizationCode } = appleLoginSchema.parse(body);

    // 使用 arctic Apple 客户端交换 token
    const tokens = await apple.validateAuthorizationCode(authorizationCode);
    const idToken = tokens.idToken;

    // 从 id_token 解析用户标识（Apple 仅在首次授权可能返回 email）
    const payload = parseJwtPayload<AppleIdTokenPayload>(idToken);
    const appleId = payload.sub;
    const appleEmail = payload.email; // 可能为 undefined

    if (!appleId) {
      const resp = createErrorResponse('LOGIN_FAILED', 'Apple 身份信息缺失');
      setCorsHeaders(resp, req);
      return resp;
    }

    // 查找或创建用户
    const existingUser = await db.getRow<{
      id: number;
      username: string;
      appleId: string | null;
      appleEmail: string | null;
      playerTag: string | null;
    }>('users', { appleId });

    let userId: number;
    let username: string;
    let roles: string[];

    if (existingUser) {
      userId = existingUser.id;
      username = existingUser.username;
      roles = await getUserRoles(existingUser.id);

      // 若这次拿到 email 且与库中不同，则更新
      if (appleEmail && appleEmail !== existingUser.appleEmail) {
        await db.transaction(async (tx) => {
          await tx.query(
            `
            UPDATE users
            SET appleEmail = ?
            WHERE id = ?
          `,
            [appleEmail, userId]
          );
        });
      }
    } else {
      // 新用户：生成一个 username（与 Google 流程一致）
      const maxIdResult = await db.query<{ maxId: number }>('SELECT MAX(id) AS maxId FROM users');
      const maxId = maxIdResult[0]?.maxId || 0;
      username = `Warrior-${maxId + 1}`;

      let newUserId: number | null = null;
      await db.transaction(async (tx) => {
        newUserId = await tx.insertOne('users', {
          username,
          googleId: null,
          googleEmail: null,
          appleId,
          appleEmail: appleEmail ?? null,
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

    // 初始化 refresh 状态并生成 jti
    const jti = crypto.randomUUID();
    await initRefreshState(userId, { initialVersion: 1, jti });

    // 签发 APP 端 JWT
    const accessToken = generateAccessToken({ userId, username, roles, jti });
    const refreshToken = generateRefreshToken(userId, 1, jti);

    const response = createSuccessResponse({
      accessToken,
      refreshToken,
      user: {
        id: userId,
        username,
        roles,
        playerTag: null,
        appleId,
        appleEmail: appleEmail ?? null,
      },
      expiresIn: {
        accessToken: 30 * 60,
        refreshToken: 30 * 24 * 60 * 60,
      },
    }, '登录成功');

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    setCorsHeaders(response, req);
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const resp = createErrorResponse('VALIDATION_ERROR', '登录数据验证失败', error.errors);
      resp.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      resp.headers.set('Pragma', 'no-cache');
      setCorsHeaders(resp, req);
      return resp;
    }
    const resp = createErrorResponse('LOGIN_FAILED', 'Apple 登录失败，请稍后重试');
    resp.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    resp.headers.set('Pragma', 'no-cache');
    setCorsHeaders(resp, req);
    return resp;
  }
});

export const OPTIONS = async (req: RequestEvent) => {
  const response = new Response(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  setCorsHeaders(response);
  return response;
};


