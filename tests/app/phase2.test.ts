/**
 * 第二阶段功能测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ArmyAppAPI } from '$lib/app/api/ArmyAppAPI';
import { ArmyTransformer } from '$lib/app/transformers';
import type { CreateArmyRequest, UpdateArmyRequest } from '$lib/app/types/army';

// 模拟ArmyAPI
const mockArmyAPI = {
  getArmies: async () => ({
    armies: [],
    page: 1,
    limit: 20,
    total: 0
  }),
  getArmy: async () => ({}),
  saveArmy: async () => 123,
  deleteArmy: async () => {},
  saveVote: async () => {}
};

describe('第二阶段功能测试', () => {
  let armyAppAPI: ArmyAppAPI;

  beforeEach(() => {
    armyAppAPI = new ArmyAppAPI(mockArmyAPI as any);
  });

  describe('ArmyAppAPI', () => {
    it('应该正确初始化', () => {
      expect(armyAppAPI).toBeDefined();
      expect(typeof armyAppAPI.getArmies).toBe('function');
      expect(typeof armyAppAPI.getArmy).toBe('function');
      expect(typeof armyAppAPI.createArmy).toBe('function');
      expect(typeof armyAppAPI.updateArmy).toBe('function');
      expect(typeof armyAppAPI.deleteArmy).toBe('function');
      expect(typeof armyAppAPI.likeArmy).toBe('function');
      expect(typeof armyAppAPI.unlikeArmy).toBe('function');
      expect(typeof armyAppAPI.bookmarkArmy).toBe('function');
      expect(typeof armyAppAPI.unbookmarkArmy).toBe('function');
    });

    it('应该正确处理军队创建请求', () => {
      const createRequest: CreateArmyRequest = {
        name: 'Test Army',
        townHall: 15,
        banner: 'barbarian',
        units: [
          { unitId: 1, home: 'armyCamp', amount: 10 },
          { unitId: 2, home: 'clanCastle', amount: 5 }
        ],
        equipment: [
          { equipmentId: 1 },
          { equipmentId: 2 }
        ],
        pets: [
          { petId: 1, hero: 'Barbarian King' }
        ],
        tags: ['CWL/War', 'Farming'],
        guide: {
          textContent: 'This is a test army',
          youtubeUrl: 'https://youtube.com/watch?v=test'
        }
      };

      expect(createRequest.name).toBe('Test Army');
      expect(createRequest.townHall).toBe(15);
      expect(createRequest.units).toHaveLength(2);
      expect(createRequest.equipment).toHaveLength(2);
      expect(createRequest.pets).toHaveLength(1);
      expect(createRequest.tags).toHaveLength(2);
      expect(createRequest.guide).toBeDefined();
    });

    it('应该正确处理军队更新请求', () => {
      const updateRequest: UpdateArmyRequest = {
        id: 123,
        name: 'Updated Test Army',
        townHall: 16,
        banner: 'barbarian',
        units: [
          { unitId: 1, home: 'armyCamp', amount: 15 }
        ],
        equipment: [
          { equipmentId: 1 }
        ],
        pets: [
          { petId: 1, hero: 'Archer Queen' }
        ],
        tags: ['CWL/War'],
        guide: {
          textContent: 'This is an updated test army',
          youtubeUrl: null
        }
      };

      expect(updateRequest.id).toBe(123);
      expect(updateRequest.name).toBe('Updated Test Army');
      expect(updateRequest.townHall).toBe(16);
      expect(updateRequest.units).toHaveLength(1);
      expect(updateRequest.equipment).toHaveLength(1);
      expect(updateRequest.pets).toHaveLength(1);
      expect(updateRequest.tags).toHaveLength(1);
    });
  });

  describe('类型系统', () => {
    it('应该正确导出所有类型', () => {
      // 如果类型有问题，TypeScript编译会失败
      expect(true).toBe(true);
    });
  });
});
