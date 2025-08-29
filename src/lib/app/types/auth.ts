/**
 * APP认证相关类型定义 - 重构版本
 * 只保留核心的认证类型，移除不必要的类型
 */

// JWT Token结构
export interface AccessToken {
  userId: number;
  username: string;
  roles: string[];
  exp: number;
  iat: number;
}

export interface RefreshToken {
  userId: number;
  tokenVersion: number;
  exp: number;
  iat: number;
}

// Google ID Token相关类型 - APP端使用
export interface GoogleIdTokenPayload {
  sub: string;           // Google用户ID
  email: string;         // 用户邮箱
  email_verified: boolean; // 邮箱是否已验证
  name: string;          // 用户全名
  picture: string;       // 用户头像URL
  given_name: string;    // 名
  family_name: string;   // 姓
  locale: string;        // 语言地区
  iat: number;           // 签发时间
  exp: number;           // 过期时间
}

// Google ID Token登录请求
export interface GoogleIdTokenLoginRequest {
  idToken: string;       // Google ID Token
}

// 核心错误代码
export const AUTH_ERROR_CODES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  GOOGLE_AUTH_FAILED: 'GOOGLE_AUTH_FAILED',
  GOOGLE_EMAIL_NOT_VERIFIED: 'GOOGLE_EMAIL_NOT_VERIFIED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  LOGIN_FAILED: 'LOGIN_FAILED',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];
