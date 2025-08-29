/**
 * 用户注册接口 - 已移除，Google OAuth自动创建用户
 */

import { createErrorResponse } from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { setCorsHeaders } from '$lib/app/middleware/cors';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = createApiEndpoint(async (req: RequestEvent) => {
  // 返回错误信息，引导用户使用Google OAuth登录
  const response = createErrorResponse(
    'REGISTRATION_NOT_NEEDED',
    '用户注册功能已移除，请使用Google OAuth登录。系统会在首次登录时自动创建用户账户。',
    {
      alternative: 'POST /app/api/v1/auth/google',
      instructions: [
        '1. 调用 POST /app/api/v1/auth/google 获取授权URL',
        '2. 在APP中打开授权URL',
        '3. 用户完成Google登录后，系统自动创建账户'
      ]
    }
  );
  
  setCorsHeaders(response);
  return response;
});
