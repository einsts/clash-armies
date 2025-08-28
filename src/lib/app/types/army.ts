/**
 * APP军队相关类型定义
 */

import type { PaginationParams, BaseQueryParams } from './common';

// 军队筛选参数
export interface ArmyFilterParams extends BaseQueryParams {
  townHall?: number;           // 大本营等级筛选
  sort?: ArmySortOption;       // 排序方式
  tags?: string[];             // 标签筛选
  creator?: string;            // 创建者筛选
}

// 排序选项
export type ArmySortOption = 
  | 'new'        // 最新创建
  | 'score'      // 评分最高
  | 'popular'    // 最受欢迎
  | 'views'      // 浏览量最高
  | 'likes'      // 点赞数最高
  | 'comments';  // 评论数最多

// APP军队数据格式
export interface AppArmy {
  id: number;
  name: string;
  townHall: number;
  banner: string;
  score: number;
  votes: number;
  pageViews: number;
  isLiked: boolean;
  isBookmarked: boolean;
  units: AppArmyUnit[];
  equipment: AppArmyEquipment[];
  pets: AppArmyPet[];
  tags: string[];
  creator: {
    id: number;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// APP军队单位
export interface AppArmyUnit {
  id: number;
  name: string;
  amount: number;
  home: 'armyCamp' | 'clanCastle';
  type: 'Troop' | 'Siege' | 'Spell';
  housingSpace: number;
  isSuper: boolean;
}

// APP军队装备
export interface AppArmyEquipment {
  id: number;
  name: string;
  hero: string;
  epic: boolean;
}

// APP军队宠物
export interface AppArmyPet {
  id: number;
  name: string;
  hero: string;
}

// 创建军队请求
export interface CreateArmyRequest {
  name: string;
  townHall: number;
  banner: string;
  units: {
    unitId: number;
    home: 'armyCamp' | 'clanCastle';
    amount: number;
  }[];
  equipment: {
    equipmentId: number;
  }[];
  pets: {
    petId: number;
    hero: string;
  }[];
  tags: string[];
  guide?: {
    textContent?: string;
    youtubeUrl?: string;
  };
}

// 更新军队请求
export interface UpdateArmyRequest extends CreateArmyRequest {
  id: number;
}

// 军队统计
export interface ArmyStats {
  totalArmies: number;
  totalLikes: number;
  totalViews: number;
  totalComments: number;
  averageScore: number;
}
