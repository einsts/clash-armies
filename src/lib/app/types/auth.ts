/**
 * APP认证相关类型定义 - 与Web端保持一致
 */

import type { DeviceType } from './common';

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

// 认证请求 - 与Web端保持一致，不包含设备信息
export interface LoginRequest {
  // 移除设备相关字段，与Web端保持一致
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  deviceId?: string;
}

// 登录状态检查
export interface LoginStatusRequest {
  action?: 'refresh_status';
}

export interface LoginStatusResponse {
  isLoggedIn: boolean;
  user?: {
    id: number;
    username: string;
    roles: string[];
    playerTag?: string;
    level?: number;
    googleId?: string;
    googleEmail?: string;
  };
  loginMethod?: 'google_oauth' | null;
  lastLogin?: string;
  sessionValid: boolean;
  error?: string;
  nextStep: string;
}

// Google OAuth相关类型 - 与Web端保持一致
export interface GoogleAuthInitRequest {
  // 移除设备相关字段，与Web端保持一致
}

export interface GoogleAuthInitResponse {
  authUrl: string;
  redirectTo: string;
  expiresIn: number;
}

export interface GoogleAuthCallbackRequest {
  code: string;
  // 移除stateId字段，与Web端保持一致
}

// 认证响应
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    username: string;
    roles: string[];
    playerTag?: string;
    level?: number;
    googleId?: string;
    googleEmail?: string;
  };
  redirect: string; // 与Web端保持一致
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// 用户信息更新
export interface UpdateProfileRequest {
  playerTag?: string;
  level?: number;
}

// 错误代码
export const AUTH_ERROR_CODES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  TOO_MANY_DEVICES: 'TOO_MANY_DEVICES',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  // Google OAuth相关错误
  GOOGLE_AUTH_FAILED: 'GOOGLE_AUTH_FAILED',
  GOOGLE_USER_NOT_FOUND: 'GOOGLE_USER_NOT_FOUND',
  GOOGLE_EMAIL_NOT_VERIFIED: 'GOOGLE_EMAIL_NOT_VERIFIED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  STATE_EXPIRED: 'STATE_EXPIRED',
  INVALID_STATE: 'INVALID_STATE',
  // 注册相关错误
  REGISTRATION_NOT_NEEDED: 'REGISTRATION_NOT_NEEDED',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];
