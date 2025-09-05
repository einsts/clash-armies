/**
 * 军队数据转换器
 */

import { BaseTransformer } from './BaseTransformer';
import type { Army } from '$models/Army.svelte';
import type { AppArmy } from '../types/army';
import type { StaticGameData } from '$types';

export class ArmyTransformer extends BaseTransformer<Army, AppArmy> {
  toAppFormat(army: Army, gameData?: StaticGameData): AppArmy {
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
      units: army.units.map(unit => {
        const unitData = gameData?.units.find(u => u.id === unit.unitId);
        return {
          id: unit.id,
          name: unitData?.name || `Unit ${unit.unitId}`,
          amount: unit.amount,
          home: unit.home,
          type: unitData?.type || 'Troop',
          housingSpace: unitData?.housingSpace || 1,
          isSuper: unitData?.isSuper || false
        };
      }),
      equipment: army.equipment.map(eq => {
        const equipmentData = gameData?.equipment.find(e => e.id === eq.equipmentId);
        return {
          id: eq.id,
          name: equipmentData?.name || `Equipment ${eq.equipmentId}`,
          hero: equipmentData?.hero || 'Barbarian King',
          epic: equipmentData?.epic || false
        };
      }),
      pets: army.pets.map(pet => {
        const petData = gameData?.pets.find(p => p.id === pet.petId);
        return {
          id: pet.id,
          name: petData?.name || `Pet ${pet.petId}`,
          hero: pet.hero
        };
      }),
      tags: army.tags,
      creator: {
        id: army.createdBy,
        username: army.username
      },
      createdAt: this.formatDate(army.createdTime),
      updatedAt: this.formatDate(army.updatedTime)
    };
  }

  toAppFormatList(dataList: Army[], gameData?: StaticGameData): AppArmy[] {
    return dataList.map(data => this.toAppFormat(data, gameData));
  }
}
