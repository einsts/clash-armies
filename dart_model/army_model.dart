// ArmyModel 主类
// 对应前端的 src/lib/models/Army.svelte.ts

import 'types.dart';
import 'army_data.dart';
import 'unit_model.dart';
import 'pet_model.dart';
import 'equipment_model.dart';
import 'guide_model.dart';
import 'comment_model.dart';

/// 军队模型类 - 前端显示数据的核心类
class ArmyModel {
  final StaticGameData gameData;

  // 数据库相关字段
  final int? id;
  final String? username;
  final int? createdBy;
  final DateTime? createdTime;
  final DateTime? updatedTime;

  // 军队基本信息
  String? name;
  int townHall;
  Banner banner;

  // 军队组成
  final List<UnitModel> units = [];
  final List<UnitModel> ccUnits = [];
  final List<PetModel> pets = [];
  final List<EquipmentModel> equipment = [];
  GuideModel? guide;

  // 社交功能
  final List<String> tags = [];
  final List<CommentModel> comments = [];
  final List<StructuredArmyComment> structuredComments = [];
  int votes;
  int userVote;
  bool userBookmarked;

  ArmyModel({
    required this.gameData,
    this.id,
    this.username,
    this.createdBy,
    this.createdTime,
    this.updatedTime,
    this.name,
    this.townHall = 17,
    this.banner = Banner.fireAndIce,
    this.votes = 0,
    this.userVote = 0,
    this.userBookmarked = false,
  });

  /// 从 Army 数据创建 ArmyModel
  factory ArmyModel.fromArmy(StaticGameData gameData, Army data) {
    final model = ArmyModel(
      gameData: gameData,
      id: data.id,
      username: data.username,
      createdBy: data.createdBy,
      createdTime: data.createdTime,
      updatedTime: data.updatedTime,
      name: data.name,
      townHall: data.townHall,
      banner: data.banner,
      votes: data.votes,
      userVote: data.userVote,
      userBookmarked: data.userBookmarked,
    );

    // 初始化单位
    for (final unit in data.units) {
      final unitModel = UnitModel.fromArmyUnit(gameData, unit);
      if (unit.home == UnitHome.armyCamp) {
        model.units.add(unitModel);
      } else if (unit.home == UnitHome.clanCastle) {
        model.ccUnits.add(unitModel);
      } else {
        throw Exception('Unit home "${unit.home}" is not implemented');
      }
    }

    // 初始化宠物
    for (final pet in data.pets) {
      model.pets.add(PetModel.fromArmyPet(gameData, pet));
    }

    // 初始化装备
    for (final equipment in data.equipment) {
      model.equipment.add(EquipmentModel.fromArmyEquipment(gameData, equipment));
    }

    // 初始化攻略
    if (data.guide != null) {
      model.guide = GuideModel.fromArmyGuide(gameData, data.guide!);
    }

    // 初始化标签
    model.tags.addAll(data.tags);

    // 初始化评论
    for (final comment in data.comments) {
      model.comments.add(CommentModel.fromArmyComment(gameData, comment));
    }
    model.structuredComments.addAll(CommentModel.structureComments(model.comments));

    return model;
  }

  /// 创建新的军队
  factory ArmyModel.create(StaticGameData gameData) {
    return ArmyModel(
      gameData: gameData,
      banner: Banner.random(),
    );
  }

  /// 获取所有单位（包括部落城堡单位）
  List<UnitModel> get allUnits {
    return [...units, ...ccUnits];
  }

  /// 获取大本营容量
  Map<String, int> get capacity {
    final thData = this.thData;
    return {
      'troops': thData.troopCapacity,
      'spells': thData.spellCapacity,
      'sieges': thData.siegeCapacity,
    };
  }

  /// 获取部落城堡容量
  Map<String, int> get ccCapacity {
    final thData = this.thData;
    return {
      'troops': thData.ccTroopCapacity,
      'spells': thData.ccSpellCapacity,
      'sieges': thData.ccSiegeCapacity,
    };
  }

  /// 获取已使用的空间
  Map<String, int> get housingSpaceUsed {
    return UnitModel.getTotals(units);
  }

  /// 获取部落城堡已使用的空间
  Map<String, int> get ccHousingSpaceUsed {
    return UnitModel.getTotals(ccUnits);
  }

  /// 获取大本营数据
  TownHall get thData {
    return requireTownHall(townHall, gameData);
  }

  /// 添加单位
  UnitModel addUnit(Unit unit, UnitHome home, {int amount = 1}) {
    final newUnit = UnitModel(
      gameData: gameData,
      unitId: unit.id,
      home: home,
      amount: amount,
      info: unit,
    );
    
    if (home == UnitHome.clanCastle) {
      ccUnits.add(newUnit);
    } else {
      units.add(newUnit);
    }
    
    return newUnit;
  }

  /// 添加宠物
  PetModel addPet(Pet pet, HeroType hero) {
    final newPet = PetModel(
      gameData: gameData,
      petId: pet.id,
      hero: hero,
      info: pet,
    );
    pets.add(newPet);
    return newPet;
  }

  /// 添加装备
  EquipmentModel addEquipment(Equipment equipment) {
    final newEquipment = EquipmentModel(
      gameData: gameData,
      equipmentId: equipment.id,
      info: equipment,
    );
    this.equipment.add(newEquipment);
    return newEquipment;
  }

  /// 添加攻略
  GuideModel addGuide() {
    guide = GuideModel.create(gameData);
    return guide!;
  }

  /// 减少单位数量
  void decrementUnitAmount(String name, UnitHome housedIn) {
    final unitsList = housedIn == UnitHome.clanCastle ? ccUnits : units;
    final index = unitsList.indexWhere((unit) => unit.info.name == name);
    
    if (index == -1) {
      throw Exception('Unit "$name" does not exist in this army');
    }
    
    if (unitsList[index].amount == 1) {
      unitsList.removeAt(index);
    } else {
      unitsList[index].amount -= 1;
    }
  }

  /// 移除单位
  void removeUnit(String name, UnitHome housedIn) {
    final unitsList = housedIn == UnitHome.clanCastle ? ccUnits : units;
    final index = unitsList.indexWhere((unit) => unit.info.name == name);
    
    if (index == -1) {
      throw Exception('Unit "$name" does not exist in this army');
    }
    
    unitsList.removeAt(index);
  }

  /// 移除宠物
  void removePet(String name) {
    final index = pets.indexWhere((p) => p.info.name == name);
    
    if (index == -1) {
      throw Exception('Pet "$name" does not exist in this army');
    }
    
    pets.removeAt(index);
  }

  /// 移除装备
  void removeEquipment(String name) {
    final index = equipment.indexWhere((p) => p.info.name == name);
    
    if (index == -1) {
      throw Exception('Equipment "$name" does not exist in this army');
    }
    
    equipment.removeAt(index);
  }

  /// 替换宠物所属英雄
  void replacePet(String name, HeroType replaceOnHero) {
    final selectedPet = pets.where((p) => p.info.name == name).firstOrNull;
    
    if (selectedPet == null) {
      throw Exception('Pet "$name" does not exist in this army');
    }
    
    selectedPet.hero = replaceOnHero;
  }

  /// 移除攻略
  void removeGuide() {
    guide = null;
  }

  /// 检查是否有英雄
  bool hasHero(HeroType hero) {
    if (equipment.any((eq) => eq.info.hero == hero)) {
      return true;
    }
    if (pets.any((pet) => pet.hero == hero)) {
      return true;
    }
    return false;
  }

  /// 获取军队统计信息
  Map<String, dynamic> getStats() {
    return {
      'type': getArmyType(),
      'hasClanCastle': ccUnits.isNotEmpty,
      'hasHeroes': HeroType.values.any((hero) => hasHero(hero)),
      'hasGuide': guide != null,
    };
  }

  /// 获取军队类型
  String getArmyType() {
    int airTotal = 0;
    int groundTotal = 0;

    for (final unit in allUnits) {
      if (unit.info.type == UnitType.spell) continue;
      
      final weight = unit.amount * unit.info.housingSpace;
      if (unit.info.isFlying) {
        airTotal += weight;
      } else {
        groundTotal += weight;
      }
    }

    final total = airTotal + groundTotal;
    final airRatio = total == 0 ? 0.0 : airTotal / total;

    // 空中或地面部队占比超过60%时判定为对应类型
    if (airRatio > 0.6) return 'Air';
    if (airRatio < 0.4) return 'Ground';
    return 'Hybrid';
  }

  /// 获取保存数据
  Map<String, dynamic> getSaveData() {
    return {
      'id': id,
      'name': name,
      'townHall': townHall,
      'units': allUnits.map((unit) => unit.getSaveData().toJson()).toList(),
      'pets': pets.map((pet) => pet.getSaveData().toJson()).toList(),
      'equipment': equipment.map((equipment) => equipment.getSaveData().toJson()).toList(),
      'guide': guide?.getSaveData().toJson(),
      'tags': tags,
      'banner': banner.value,
    };
  }

  /// 获取英雄最大等级
  static int getMaxHeroLevel(HeroType hero, int townHall, StaticGameData gameData) {
    final thData = requireTownHall(townHall, gameData);
    
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
  static TownHall requireTownHall(int level, StaticGameData gameData) {
    final th = gameData.townHalls.where((th) => th.level == level).firstOrNull;
    if (th == null) {
      throw Exception('Expected town hall $level');
    }
    return th;
  }

  /// 检查军队是否有效
  bool get isValid {
    return name != null && 
           name!.isNotEmpty && 
           name!.length >= 2 && 
           name!.length <= 25 && 
           units.isNotEmpty;
  }

  /// 检查是否有部落城堡单位
  bool get hasClanCastleUnits {
    return ccUnits.isNotEmpty;
  }

  /// 检查是否有英雄
  bool get hasAnyHero {
    return HeroType.values.any((hero) => hasHero(hero));
  }

  /// 检查是否有攻略
  bool get hasGuide {
    return guide != null && guide!.isValid;
  }

  /// 获取军队标签（自动生成 + 用户选择）
  List<String> getTags() {
    final List<String> autoTags = [];
    
    // 根据军队类型添加标签
    final armyType = getArmyType();
    if (armyType == 'Air') {
      autoTags.add('Air Attack');
    } else if (armyType == 'Ground') {
      autoTags.add('Ground Attack');
    } else {
      autoTags.add('Hybrid Attack');
    }
    
    // 根据大本营等级添加标签
    if (townHall >= 15) {
      autoTags.add('High TH');
    } else if (townHall <= 10) {
      autoTags.add('Low TH');
    }
    
    // 合并用户选择的标签
    final allTags = {...autoTags, ...tags};
    return allTags.toList();
  }
}
