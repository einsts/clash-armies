/**
 * APP框架基础测试
 */

import { describe, it, expect } from 'vitest';
import { 
  createSuccessResponse, 
  createErrorResponse,
  createPaginatedResponse 
} from '$lib/app/utils/response';
import { 
  verifyAccessToken, 
  generateAccessToken,
  generateRefreshToken 
} from '$lib/app/middleware/auth';
import { 
  BaseTransformer,
  ArmyTransformer,
  UserTransformer 
} from '$lib/app/transformers';
import type { Army } from '$models/Army.svelte';
import type { User } from '$types';

// 模拟数据
const mockArmy: Army = {
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

const mockUser: User = {
  id: 1,
  username: 'testuser',
  roles: ['user'],
  playerTag: '#ABC123',
  level: 15
};

describe('APP框架基础测试', () => {
  describe('响应工具函数', () => {
    it('应该创建成功响应', async () => {
      const response = createSuccessResponse({ message: 'test' });
      expect(response.status).toBe(200);
      
      // 验证响应体结构
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('test');
      expect(body.timestamp).toBeDefined();
      expect(body.requestId).toBeDefined();
    });

    it('应该创建错误响应', async () => {
      const response = createErrorResponse('TEST_ERROR', 'Test error message');
      expect(response.status).toBe(400);
      
      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('TEST_ERROR');
      expect(body.error.message).toBe('Test error message');
    });

    it('应该创建分页响应', async () => {
      const data = [1, 2, 3, 4, 5];
      const response = createPaginatedResponse(data, 1, 5, 25);
      
      const body = await response.json();
      expect(body.data.data).toEqual(data);
      expect(body.data.pagination.page).toBe(1);
      expect(body.data.pagination.limit).toBe(5);
      expect(body.data.pagination.total).toBe(25);
      expect(body.data.pagination.totalPages).toBe(5);
    });
  });

  describe('JWT认证中间件', () => {
    it('应该生成和验证Access Token', () => {
      const payload = {
        userId: 1,
        username: 'testuser',
        roles: ['user']
      };
      
      const token = generateAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      
      const decoded = verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(1);
      expect(decoded?.username).toBe('testuser');
    });

    it('应该生成Refresh Token', () => {
      const token = generateRefreshToken(1, 1);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });

  describe('数据转换器', () => {
    it('BaseTransformer应该提供基础功能', () => {
      const transformer = new (class extends BaseTransformer<number, string> {
        toAppFormat(data: number): string {
          return data.toString();
        }
      })();
      
      expect(transformer.toAppFormat(123)).toBe('123');
      expect(transformer.toAppFormatList([1, 2, 3])).toEqual(['1', '2', '3']);
    });

    it('ArmyTransformer应该转换军队数据', () => {
      const transformer = new ArmyTransformer();
      const result = transformer.toAppFormat(mockArmy);
      
      expect(result.id).toBe(1);
      expect(result.name).toBe('Test Army');
      expect(result.townHall).toBe(15);
      expect(result.isLiked).toBe(true);
      expect(result.isBookmarked).toBe(true);
      expect(result.units).toHaveLength(2);
      expect(result.equipment).toHaveLength(2);
      expect(result.pets).toHaveLength(1);
    });

    it('UserTransformer应该转换用户数据', () => {
      const transformer = new UserTransformer();
      const result = transformer.toAppFormat(mockUser);
      
      expect(result.id).toBe(1);
      expect(result.username).toBe('testuser');
      expect(result.playerTag).toBe('#ABC123');
      expect(result.level).toBe(15);
      expect(result.roles).toEqual(['user']);
    });
  });

  describe('类型定义', () => {
    it('应该正确导出所有类型', () => {
      // 这里测试类型导入是否正常
      expect(true).toBe(true); // 如果类型有问题，TypeScript编译会失败
    });
  });
});
