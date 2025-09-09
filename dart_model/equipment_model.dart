// EquipmentModel 类
// 对应前端的 src/lib/models/Equipment.svelte.ts

import 'types.dart';
import 'army_data.dart';

/// 装备模型类
class EquipmentModel {
  final StaticGameData gameData;
  final int? id;
  final int equipmentId;
  final Equipment info;

  EquipmentModel({
    required this.gameData,
    this.id,
    required this.equipmentId,
    required this.info,
  });

  /// 从 ArmyEquipment 创建 EquipmentModel
  factory EquipmentModel.fromArmyEquipment(StaticGameData gameData, ArmyEquipment data) {
    return EquipmentModel(
      gameData: gameData,
      id: data.id,
      equipmentId: data.equipmentId,
      info: require(data.equipmentId, gameData),
    );
  }

  /// 获取保存数据
  ArmyEquipment getSaveData() {
    return ArmyEquipment(
      id: id,
      equipmentId: equipmentId,
    );
  }

  /// 根据 equipmentId 获取装备信息
  static Equipment require(int equipmentId, StaticGameData gameData) {
    final eq = gameData.equipment.where((eq) => eq.id == equipmentId).firstOrNull;
    if (eq == null) {
      throw Exception('Expected equipment "$equipmentId"');
    }
    return eq;
  }

  /// 根据名称获取装备
  static Equipment requireByName(String name, StaticGameData gameData) {
    final eq = gameData.equipment.where((p) => p.name == name).firstOrNull;
    if (eq == null) {
      throw Exception('Expected equipment "$name"');
    }
    return eq;
  }

  /// 根据 Clash ID 获取装备
  static Equipment requireByClashID(int clashId, StaticGameData gameData) {
    final eq = gameData.equipment.where((eq) => eq.clashId == clashId).firstOrNull;
    if (eq == null) {
      throw Exception('Expected equipment "$clashId"');
    }
    return eq;
  }

  /// 获取装备最大等级
  static int getMaxLevel(String name, int townHall, StaticGameData gameData) {
    final thData = _requireTownHall(townHall, gameData);
    final appEquipment = requireByName(name, gameData);
    
    // 检查英雄是否解锁
    if (_getMaxHeroLevel(appEquipment.hero, townHall, gameData) == -1) {
      return -1;
    }
    
    int maxLevel = -1;
    for (final levelData in appEquipment.levels) {
      if ((levelData.blacksmithLevel ?? -1) > (thData.maxBlacksmith ?? -1)) {
        return maxLevel;
      }
      maxLevel = levelData.level;
    }
    return maxLevel;
  }

  /// 获取英雄最大等级
  static int _getMaxHeroLevel(HeroType hero, int townHall, StaticGameData gameData) {
    final thData = _requireTownHall(townHall, gameData);
    
    switch (hero) {
      case HeroType.barbarianKing:
        return thData.maxBarbarianKing ?? -1;
      case HeroType.archerQueen:
        return thData.maxArcherQueen ?? -1;
      case HeroType.grandWarden:
        return thData.maxGrandWarden ?? -1;
      case HeroType.royalChampion:
        return thData.maxRoyalChampion ?? -1;
      case HeroType.minionPrince:
        return thData.maxMinionPrince ?? -1;
    }
  }

  /// 获取大本营数据
  static TownHall _requireTownHall(int level, StaticGameData gameData) {
    final th = gameData.townHalls.where((th) => th.level == level).firstOrNull;
    if (th == null) {
      throw Exception('Expected town hall $level');
    }
    return th;
  }
}
