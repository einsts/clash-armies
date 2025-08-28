/**
 * 用户注册接口
 */

import { createSuccessResponse, createValidationErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';

// 注册请求验证schema
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(6),
  playerTag: z.string().optional()
});

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  try {
    const body = await req.request.json();
    const validatedData = registerSchema.parse(body);
    
    // TODO: 实现实际的用户注册逻辑
    // 这里应该调用现有的UserAPI
    
    const response = createSuccessResponse({
      message: 'User registered successfully',
      userId: 123 // 临时ID
    });
    
    setCorsHeaders(response);
    return response;
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      const response = createValidationErrorResponse(
        'VALIDATION_ERROR',
        'Registration data validation failed',
        error.errors
      );
      setCorsHeaders(response);
      return response;
    }
    
    throw error; // 让错误处理中间件处理
  }
});
