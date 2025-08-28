/**
 * APP框架集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  createSuccessResponse, 
  createErrorResponse
} from '$lib/app/utils/response';
import { createApiEndpoint } from '$lib/app/middleware/errorHandler';
import { 
  jwtAuthMiddleware,
  requireAuth,
  hasRole 
} from '$lib/app/middleware/auth';
import { rateLimitMiddleware } from '$lib/app/middleware/rateLimit';
import { 
  ArmyTransformer,
  UserTransformer 
} from '$lib/app/transformers';
import type { RequestEvent } from '@sveltejs/kit';

// 模拟RequestEvent
const createMockRequestEvent = (method: string = 'GET', headers: Record<string, string> = {}): RequestEvent => {
  const request = new Request('http://localhost:3000/test', {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  
  return {
    request,
    getClientAddress: () => '127.0.0.1',
    locals: {},
    params: {},
    route: { id: '/test' },
    url: new URL('http://localhost:3000/test'),
    isDataRequest: false,
    isSubRequest: false,
    platform: undefined,
    setHeaders: () => {},
    depends: () => {},
    fetch: () => Promise.resolve(new Response()),
    parentData: () => Promise.resolve({}),
    routeData: () => Promise.resolve({}),
    error: () => {},
    redirect: () => {},
    invalidate: () => Promise.resolve({}),
    invalidateAll: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    setViewport: () => {},
    cookies: {
      get: () => undefined,
      set: () => {},
      delete: () => {},
      getAll: () => [],
      serialize: () => ''
    }
  } as any;
};

describe('APP框架集成测试', () => {
  describe('中间件协作', () => {
    it('应该正确处理认证和限流', () => {
      const req = createMockRequestEvent('GET', {
        'Authorization': 'Bearer invalid-token'
      });
      
      // 测试限流中间件
      expect(() => rateLimitMiddleware()(req)).not.toThrow();
      
      // 测试认证中间件
      const user = jwtAuthMiddleware(req);
      expect(user).toBeNull(); // 无效token应该返回null
    });

    it('应该正确处理需要认证的端点', () => {
      const req = createMockRequestEvent('GET', {
        'Authorization': 'Bearer invalid-token'
      });
      
      // 测试需要认证的中间件
      expect(() => requireAuth(req)).toThrow('Authentication required');
    });
  });

  describe('API端点包装器', () => {
    it('应该正确处理成功的API调用', async () => {
      const handler = async (req: RequestEvent) => {
        return createSuccessResponse({ message: 'success' });
      };
      
      const wrappedHandler = createApiEndpoint(handler);
      const req = createMockRequestEvent();
      const response = await wrappedHandler(req);
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.success).toBe(true);
    });

    it('应该正确处理API错误', async () => {
      const handler = async (req: RequestEvent) => {
        throw new Error('Test error');
      };
      
      const wrappedHandler = createApiEndpoint(handler);
      const req = createMockRequestEvent();
      const response = await wrappedHandler(req);
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('数据转换器协作', () => {
    it('应该正确处理复杂的转换场景', () => {
      const armyTransformer = new ArmyTransformer();
      const userTransformer = new UserTransformer();
      
      // 模拟数据
      const mockArmy = {
        id: 1,
        name: 'Test Army',
        townHall: 15,
        banner: 'barbarian',
        score: 95.5,
        votes: 10,
        pageViews: 100,
        openLinkClicks: 5,
        copyLinkClicks: 3,
        units: [
          { id: 1, unitId: 1, home: 'armyCamp', amount: 10 },
          { id: 2, unitId: 2, home: 'clanCastle', amount: 5 }
        ],
        equipment: [
          { id: 1, equipmentId: 1 },
          { id: 2, equipmentId: 2 }
        ],
        pets: [
          { id: 1, petId: 1, hero: 'Barbarian King' }
        ],
        tags: ['CWL/War', 'Farming'],
        comments: [],
        username: 'testuser',
        createdBy: 1,
        createdTime: new Date('2024-01-01'),
        updatedTime: new Date('2024-01-01'),
        userVote: 1,
        userBookmarked: true,
        guide: null
      };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        roles: ['user'],
        playerTag: '#ABC123',
        level: 15
      };
      
      // 转换数据
      const armyResult = armyTransformer.toAppFormat(mockArmy as any);
      const userResult = userTransformer.toAppFormat(mockUser);
      
      // 验证转换结果
      expect(armyResult.id).toBe(1);
      expect(armyResult.name).toBe('Test Army');
      expect(armyResult.units).toHaveLength(2);
      expect(armyResult.equipment).toHaveLength(2);
      expect(armyResult.pets).toHaveLength(1);
      
      expect(userResult.id).toBe(1);
      expect(userResult.username).toBe('testuser');
      expect(userResult.roles).toEqual(['user']);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理不同类型的错误', async () => {
      const validationError = new Error('Validation failed');
      (validationError as any).name = 'ZodError';
      (validationError as any).errors = [{ message: 'Invalid input' }];
      
      const handler = async (req: RequestEvent) => {
        throw validationError;
      };
      
      const wrappedHandler = createApiEndpoint(handler);
      const req = createMockRequestEvent();
      const response = await wrappedHandler(req);
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.success).toBe(false);
    });
  });
});
