/**
 * 军队数据转换器
 */

import { BaseTransformer } from './BaseTransformer';
import type { Army } from '$models/Army.svelte';
import type { AppArmy } from '../types/army';

export class ArmyTransformer extends BaseTransformer<Army, AppArmy> {
  toAppFormat(army: Army): AppArmy {
    return {
      id: army.id,
      name: army.name,
      townHall: army.townHall,
      banner: army.banner,
      score: this.formatNumber(army.score),
      votes: army.votes,
      pageViews: army.pageViews,
      isLiked: this.formatBoolean(army.userVote === 1),
      isBookmarked: this.formatBoolean(army.userBookmarked),
      units: army.units.map(unit => ({
        id: unit.id,
        name: `Unit ${unit.unitId}`, // 这里需要从gameData获取实际名称
        amount: unit.amount,
        home: unit.home,
        type: 'Troop' as const, // 默认类型，实际应该从gameData获取
        housingSpace: 1, // 默认值，实际应该从gameData获取
        isSuper: false // 默认值，实际应该从gameData获取
      })),
      equipment: army.equipment.map(eq => ({
        id: eq.id,
        name: `Equipment ${eq.equipmentId}`, // 这里需要从gameData获取实际名称
        hero: 'Barbarian King' as const, // 默认值，实际应该从gameData获取
        epic: false // 默认值，实际应该从gameData获取
      })),
      pets: army.pets.map(pet => ({
        id: pet.id,
        name: `Pet ${pet.petId}`, // 这里需要从gameData获取实际名称
        hero: pet.hero
      })),
      tags: army.tags,
      creator: {
        id: army.createdBy,
        username: army.username
      },
      createdAt: this.formatDate(army.createdTime),
      updatedAt: this.formatDate(army.updatedTime)
    };
  }
}
