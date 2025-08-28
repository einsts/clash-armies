/**
 * APP响应格式化工具
 */

import { json } from '@sveltejs/kit';
import type { ApiSuccessResponse, ApiErrorResponse } from '../types/common';
import { v4 as uuidv4 } from 'uuid';

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(
  data: T, 
  message?: string
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: uuidv4()
  };
  
  return json(response);
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): Response {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString(),
    requestId: uuidv4()
  };
  
  return json(response, { status });
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): Response {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  const paginatedData = {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev
    }
  };
  
  return createSuccessResponse(paginatedData);
}

/**
 * 创建认证错误响应
 */
export function createAuthErrorResponse(
  code: string,
  message: string,
  details?: any
): Response {
  return createErrorResponse(code, message, details, 401);
}

/**
 * 创建权限错误响应
 */
export function createPermissionErrorResponse(
  code: string,
  message: string,
  details?: any
): Response {
  return createErrorResponse(code, message, details, 403);
}

/**
 * 创建验证错误响应
 */
export function createValidationErrorResponse(
  code: string,
  message: string,
  details?: any
): Response {
  return createErrorResponse(code, message, details, 422);
}

/**
 * 创建服务器错误响应
 */
export function createServerErrorResponse(
  code: string,
  message: string,
  details?: any
): Response {
  return createErrorResponse(code, message, details, 500);
}
