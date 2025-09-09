// PetModel 类
// 对应前端的 src/lib/models/Pet.svelte.ts

import 'types.dart';
import 'army_data.dart';

/// 宠物模型类
class PetModel {
  final StaticGameData gameData;
  final int? id;
  final int petId;
  HeroType hero;
  final Pet info;

  PetModel({
    required this.gameData,
    this.id,
    required this.petId,
    required this.hero,
    required this.info,
  });

  /// 从 ArmyPet 创建 PetModel
  factory PetModel.fromArmyPet(StaticGameData gameData, ArmyPet data) {
    return PetModel(
      gameData: gameData,
      id: data.id,
      petId: data.petId,
      hero: data.hero,
      info: require(data.petId, gameData),
    );
  }

  /// 获取保存数据
  ArmyPet getSaveData() {
    return ArmyPet(
      id: id,
      petId: petId,
      hero: hero,
    );
  }

  /// 根据 petId 获取宠物信息
  static Pet require(int petId, StaticGameData gameData) {
    final pet = gameData.pets.where((p) => p.id == petId).firstOrNull;
    if (pet == null) {
      throw Exception('Expected pet "$petId"');
    }
    return pet;
  }

  /// 根据名称获取宠物
  static Pet requireByName(String name, StaticGameData gameData) {
    final pet = gameData.pets.where((p) => p.name == name).firstOrNull;
    if (pet == null) {
      throw Exception('Expected pet "$name"');
    }
    return pet;
  }

  /// 根据 Clash ID 获取宠物
  static Pet requireByClashID(int clashId, StaticGameData gameData) {
    final pet = gameData.pets.where((p) => p.clashId == clashId).firstOrNull;
    if (pet == null) {
      throw Exception('Expected pet "$clashId"');
    }
    return pet;
  }

  /// 获取宠物最大等级
  static int getMaxLevel(String name, int townHall, StaticGameData gameData) {
    final thData = _requireTownHall(townHall, gameData);
    final appPet = requireByName(name, gameData);
    final prodLevel = thData.maxPetHouse;
    
    if (prodLevel == null) {
      // 宠物屋在此大本营等级未解锁
      return -1;
    }
    
    int maxLevel = -1;
    for (final levelData in appPet.levels) {
      if ((levelData.petHouseLevel ?? -1) > prodLevel) {
        return maxLevel;
      }
      maxLevel = levelData.level;
    }
    return maxLevel;
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
