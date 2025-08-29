/**
 * 军队APP API适配层
 * 包装现有的ArmyAPI，提供APP专用的接口
 */

import type { ArmyAPI } from '$lib/server/api/ArmyAPI';
import type { RequestEvent } from '@sveltejs/kit';
import { ArmyTransformer } from '../transformers';
import type { 
  ArmyFilterParams, 
  CreateArmyRequest, 
  UpdateArmyRequest,
  AppArmy 
} from '../types/army';
import type { PaginatedResponse } from '../types/common';
import type { Army } from '../types/army';

export class ArmyAppAPI {
  constructor(private armyAPI: ArmyAPI) {}

  /**
   * 获取军队列表（APP格式）
   */
  async getArmies(req: RequestEvent, filters: ArmyFilterParams): Promise<PaginatedResponse<AppArmy>> {
    // 调用现有的getArmies方法
    const result = await this.armyAPI.getArmies(req, {
      page: filters.page || 1,
      limit: filters.limit || 20,
      townHall: filters.townHall,
      sort: filters.sort || 'new',
      tags: filters.tags,
      search: filters.search,
      creator: filters.creator
    });

    // 转换数据格式
    const transformer = new ArmyTransformer();
    const appArmies = transformer.toAppFormatList(result.armies);

    return {
      data: appArmies,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
        hasNext: result.page < Math.ceil(result.total / result.limit),
        hasPrev: result.page > 1
      }
    };
  }

  /**
   * 获取军队详情（APP格式）
   */
  async getArmy(req: RequestEvent, armyId: number): Promise<AppArmy> {
    // 调用现有的getArmy方法
    const army = await this.armyAPI.getArmy(req, armyId);
    
    // 转换数据格式
    const transformer = new ArmyTransformer();
    return transformer.toAppFormat(army);
  }

  /**
   * 创建军队
   */
  async createArmy(req: RequestEvent, data: CreateArmyRequest): Promise<number> {
    // 转换APP格式到现有格式
    const armyData = {
      name: data.name,
      townHall: data.townHall,
      banner: data.banner,
      units: data.units.map(unit => ({
        unitId: unit.unitId,
        home: unit.home,
        amount: unit.amount
      })),
      equipment: data.equipment.map(eq => ({
        equipmentId: eq.equipmentId
      })),
      pets: data.pets.map(pet => ({
        petId: pet.petId,
        hero: pet.hero
      })),
      tags: data.tags,
      guide: data.guide
    };

    // 调用现有的saveArmy方法
    return await this.armyAPI.saveArmy(req, armyData);
  }

  /**
   * 更新军队
   */
  async updateArmy(req: RequestEvent, armyId: number, data: UpdateArmyRequest): Promise<void> {
    // 转换APP格式到现有格式
    const armyData = {
      id: armyId,
      name: data.name,
      townHall: data.townHall,
      banner: data.banner,
      units: data.units.map(unit => ({
        unitId: unit.unitId,
        home: unit.home,
        amount: unit.amount
      })),
      equipment: data.equipment.map(eq => ({
        equipmentId: eq.equipmentId
      })),
      pets: data.pets.map(pet => ({
        petId: pet.petId,
        hero: pet.hero
      })),
      tags: data.tags,
      guide: data.guide
    };

    // 调用现有的saveArmy方法
    await this.armyAPI.saveArmy(req, armyData);
  }

  /**
   * 删除军队
   */
  async deleteArmy(req: RequestEvent, armyId: number): Promise<void> {
    await this.armyAPI.deleteArmy(req, armyId);
  }

  /**
   * 点赞军队
   */
  async likeArmy(req: RequestEvent, armyId: number): Promise<void> {
    await this.armyAPI.saveVote(req, armyId, 1);
  }

  /**
   * 取消点赞
   */
  async unlikeArmy(req: RequestEvent, armyId: number): Promise<void> {
    await this.armyAPI.saveVote(req, armyId, 0);
  }

  /**
   * 收藏军队
   */
  async bookmarkArmy(req: RequestEvent, armyId: number): Promise<void> {
    // 使用现有的收藏系统
    await this.armyAPI.bookmark(req, armyId);
  }

  /**
   * 取消收藏
   */
  async unbookmarkArmy(req: RequestEvent, armyId: number): Promise<void> {
    // 使用现有的取消收藏系统
    await this.armyAPI.removeBookmark(req, armyId);
  }

  /**
   * 获取用户收藏的军队
   */
  async getSavedArmies(req: RequestEvent, username: string): Promise<Army[]> {
    // 使用现有的获取收藏军队方法
    return this.armyAPI.getSavedArmies(req, { username });
  }
}
