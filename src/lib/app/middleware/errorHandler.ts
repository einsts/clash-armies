/**
 * APP错误处理中间件
 */

import type { RequestEvent } from '@sveltejs/kit';
import { createServerErrorResponse, createValidationErrorResponse } from '../utils/response';
import { z } from 'zod';

/**
 * 全局错误处理中间件
 */
export function errorHandlerMiddleware(
  handler: (req: RequestEvent) => Promise<Response>
) {
  return async (req: RequestEvent): Promise<Response> => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);
      
      // 处理不同类型的错误
      if (error instanceof z.ZodError) {
        return createValidationErrorResponse(
          'VALIDATION_ERROR',
          'Request validation failed',
          error.errors
        );
      }
      
      if (error instanceof Error) {
        // 处理已知错误
        if (error.message === 'Authentication required') {
          return createServerErrorResponse(
            'UNAUTHORIZED',
            'Authentication required',
            { message: error.message }
          );
        }
        
        if (error.message === 'Insufficient permissions') {
          return createServerErrorResponse(
            'FORBIDDEN',
            'Insufficient permissions',
            { message: error.message }
          );
        }
        
        if (error.message === 'Access denied') {
          return createServerErrorResponse(
            'FORBIDDEN',
            'Access denied',
            { message: error.message }
          );
        }
        
        if (error.message === 'Rate limit exceeded') {
          return createServerErrorResponse(
            'RATE_LIMIT_EXCEEDED',
            'Too many requests',
            { message: error.message }
          );
        }
        
        // 其他已知错误
        return createServerErrorResponse(
          'INTERNAL_ERROR',
          error.message,
          { stack: error.stack }
        );
      }
      
      // 未知错误
      return createServerErrorResponse(
        'UNKNOWN_ERROR',
        'An unexpected error occurred',
        { error: String(error) }
      );
    }
  };
}

/**
 * 创建API端点包装器
 */
export function createApiEndpoint(
  handler: (req: RequestEvent) => Promise<Response>
) {
  return errorHandlerMiddleware(handler);
}
