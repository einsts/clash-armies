/**
 * Token刷新接口
 */

import { createSuccessResponse, createAuthErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from '$lib/app/middleware/auth';
import { db } from '$server/db';
import { getRefreshState, bumpVersionIfMatch } from '$lib/app/server/refreshTokens';
import { getUserRoles } from '$lib/app/server/users';
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
      setCorsHeaders(response, req);
      return response;
    }
    
    // 读取 DB 中版本
    const state = await getRefreshState(decoded.userId);
    if (!state) {
      const response = createAuthErrorResponse('TOKEN_INVALID', '刷新状态不存在，请重新登录');
      setCorsHeaders(response, req);
      return response;
    }
    
    // 重用检测：旧版本再次使用
    if (decoded.tokenVersion !== state.tokenVersion) {
      const response = createAuthErrorResponse('TOKEN_INVALID', '刷新Token已失效，请重新登录');
      setCorsHeaders(response);
      return response;
    }
    
    // 尝试原子 +1（并写入新的 jti）
    const newJti = crypto.randomUUID();
    const bumped = await bumpVersionIfMatch(decoded.userId, state.tokenVersion, { newJti });
    if (!bumped) {
      const response = createAuthErrorResponse('TOKEN_INVALID', '刷新冲突，请重试');
      setCorsHeaders(response);
      return response;
    }
    
    // 尝试读取用户与角色信息
    const userRow = await db.getRow<{ id: number; username: string }>('users', { id: decoded.userId });
    if (!userRow) {
      const response = createAuthErrorResponse('USER_NOT_FOUND', '用户不存在');
      setCorsHeaders(response);
      return response;
    }
    const roles = await getUserRoles(decoded.userId);
    
    // 生成新的Token对
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      username: userRow.username,
      roles,
      jti: newJti,
    });
    
    const newRefreshToken = generateRefreshToken(decoded.userId, state.tokenVersion + 1, newJti);
    
    const response = createSuccessResponse({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: {
        accessToken: 24 * 60 * 60,
        refreshToken: 30 * 24 * 60 * 60,
      }
    }, '刷新成功');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    setCorsHeaders(response, req);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createAuthErrorResponse(
        'VALIDATION_ERROR',
        '刷新Token数据验证失败',
        error.errors
      );
      setCorsHeaders(response, req);
      return response;
    }
    
    throw error; // 让错误处理中间件处理其他错误
  }
});

export const OPTIONS = async (req: RequestEvent) => {
  const response = new Response(null, { status: 204 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  setCorsHeaders(response);
  return response;
};
