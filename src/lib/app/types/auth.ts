/**
 * APP认证相关类型定义
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

// 设备管理
export interface AppDevice {
  id: string;
  userId: number;
  deviceName: string;
  deviceType: DeviceType;
  deviceToken?: string;
  isActive: boolean;
  lastLoginAt: Date;
  createdAt: Date;
}

// 认证请求
export interface LoginRequest {
  username: string;
  password: string;
  deviceName?: string;
  deviceType?: DeviceType;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  playerTag?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  deviceId?: string;
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
  };
  device: AppDevice;
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
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_REVOKED: 'TOKEN_REVOKED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  TOO_MANY_DEVICES: 'TOO_MANY_DEVICES',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export type AuthErrorCode = typeof AUTH_ERROR_CODES[keyof typeof AUTH_ERROR_CODES];
