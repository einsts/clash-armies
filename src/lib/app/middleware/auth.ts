/**
 * APP JWT认证中间件
 */

import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';
import type { RequestEvent } from '@sveltejs/kit';
import type { AccessToken } from '../types/auth';
import { createAuthErrorResponse } from '../utils/response';

const JWT_SECRET = env.APP_JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = env.APP_REFRESH_SECRET || 'fallback-refresh-secret';

/**
 * 验证Access Token
 */
export function verifyAccessToken(token: string): AccessToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessToken;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 验证Refresh Token
 */
export function verifyRefreshToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * 生成Access Token
 */
export function generateAccessToken(payload: Omit<AccessToken, 'exp' | 'iat'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

/**
 * 生成Refresh Token
 */
export function generateRefreshToken(userId: number, tokenVersion: number): string {
  return jwt.sign(
    { userId, tokenVersion },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * JWT认证中间件
 */
export function jwtAuthMiddleware(req: RequestEvent): AccessToken | null {
  const authHeader = req.request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);
  
  if (!decoded) {
    return null;
  }
  
  // 检查Token是否过期
  if (decoded.exp * 1000 < Date.now()) {
    return null;
  }
  
  return decoded;
}

/**
 * 需要认证的中间件
 */
export function requireAuth(req: RequestEvent): AccessToken {
  const user = jwtAuthMiddleware(req);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * 检查用户角色
 */
export function hasRole(user: AccessToken, role: string): boolean {
  return user.roles.includes(role);
}

/**
 * 需要特定角色的中间件
 */
export function requireRole(req: RequestEvent, role: string): AccessToken {
  const user = requireAuth(req);
  
  if (!hasRole(user, role)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}

/**
 * 检查用户是否为资源所有者
 */
export function isResourceOwner(user: AccessToken, resourceUserId: number): boolean {
  return user.userId === resourceUserId;
}

/**
 * 需要资源所有权的中间件
 */
export function requireResourceOwner(req: RequestEvent, resourceUserId: number): AccessToken {
  const user = requireAuth(req);
  
  if (!isResourceOwner(user, resourceUserId)) {
    throw new Error('Access denied');
  }
  
  return user;
}
