// UnitModel 类
// 对应前端的 src/lib/models/Unit.svelte.ts

import 'types.dart';
import 'army_data.dart';

/// 单位模型类
class UnitModel {
  final StaticGameData gameData;
  final int? id;
  final int unitId;
  final UnitHome home;
  int amount;
  final Unit info;

  UnitModel({
    required this.gameData,
    this.id,
    required this.unitId,
    required this.home,
    required this.amount,
    required this.info,
  });

  /// 从 ArmyUnit 创建 UnitModel
  factory UnitModel.fromArmyUnit(StaticGameData gameData, ArmyUnit data) {
    return UnitModel(
      gameData: gameData,
      id: data.id,
      unitId: data.unitId,
      home: data.home,
      amount: data.amount,
      info: require(data.unitId, gameData),
    );
  }

  /// 获取保存数据
  ArmyUnit getSaveData() {
    return ArmyUnit(
      id: id,
      unitId: unitId,
      home: home,
      amount: amount,
    );
  }

  /// 根据 unitId 获取单位信息
  static Unit require(int unitId, StaticGameData gameData) {
    final unit = gameData.units.where((u) => u.id == unitId).firstOrNull;
    if (unit == null) {
      throw Exception('Expected unit "$unitId"');
    }
    return unit;
  }

  /// 根据名称获取兵种
  static Unit requireTroopByName(String name, StaticGameData gameData) {
    final unit = gameData.units.where((u) => 
        (u.type == UnitType.troop || u.type == UnitType.siege) && u.name == name
    ).firstOrNull;
    if (unit == null) {
      throw Exception('Expected troop "$name"');
    }
    return unit;
  }

  /// 根据名称获取法术
  static Unit requireSpellByName(String name, StaticGameData gameData) {
    final unit = gameData.units.where((u) => 
        u.type == UnitType.spell && u.name == name
    ).firstOrNull;
    if (unit == null) {
      throw Exception('Expected spell "$name"');
    }
    return unit;
  }

  /// 根据 Clash ID 获取兵种
  static Unit requireTroopByClashID(int clashId, StaticGameData gameData) {
    final unit = gameData.units.where((u) => 
        (u.type == UnitType.troop || u.type == UnitType.siege) && u.clashId == clashId
    ).firstOrNull;
    if (unit == null) {
      throw Exception('Expected troop "$clashId"');
    }
    return unit;
  }

  /// 根据 Clash ID 获取法术
  static Unit requireSpellByClashID(int clashId, StaticGameData gameData) {
    final unit = gameData.units.where((u) => 
        u.type == UnitType.spell && u.clashId == clashId
    ).firstOrNull;
    if (unit == null) {
      throw Exception('Expected spell "$clashId"');
    }
    return unit;
  }

  /// 计算单位占用的空间
  static Map<String, int> getTotals(List<UnitModel> units) {
    int troops = 0;
    int sieges = 0;
    int spells = 0;

    for (final unit in units) {
      final key = unit.info.type == UnitType.troop ? 'troops' : 
                  unit.info.type == UnitType.siege ? 'sieges' : 'spells';
      final space = unit.info.housingSpace * unit.amount;
      
      switch (key) {
        case 'troops':
          troops += space;
          break;
        case 'sieges':
          sieges += space;
          break;
        case 'spells':
          spells += space;
          break;
      }
    }

    return {
      'troops': troops,
      'sieges': sieges,
      'spells': spells,
    };
  }

  /// 获取单位最大等级
  static int getMaxLevel(Unit unit, int townHall, StaticGameData gameData) {
    final thData = _requireTownHall(townHall, gameData);
    final name = unit.name;
    final type = unit.type;

    int maxLevel = -1;

    for (final levelData in unit.levels) {
      final level = levelData.level;

      if (type == UnitType.troop) {
        // 获取单位的生产建筑等级
        final prod = unit.productionBuilding;
        int? prodLevel;
        if (prod == 'Barrack') {
          prodLevel = thData.maxBarracks;
        } else if (prod == 'Dark Elixir Barrack') {
          prodLevel = thData.maxDarkBarracks;
        }
        
        if (prodLevel == null) {
          throw Exception('Unrecognized production building "$prod" for troop "$name"');
        }
        
        // 检查兵种是否通过兵营解锁
        if ((levelData.barrackLevel ?? -1) > prodLevel) {
          return maxLevel;
        }
      }

      if (type == UnitType.siege) {
        // 攻城机器工坊在大本营12级解锁
        if (thData.level < 12 || thData.maxWorkshop == null) {
          return -1;
        }
        // 检查攻城机器是否通过工坊解锁
        if ((levelData.barrackLevel ?? -1) > thData.maxWorkshop!) {
          return maxLevel;
        }
      }

      if (type == UnitType.spell) {
        // 法术工厂在大本营5级解锁
        if (thData.level < 5) {
          return maxLevel;
        }
        // 获取单位的生产建筑等级
        final prod = unit.productionBuilding;
        int? prodLevel;
        if (prod == 'Spell Factory') {
          prodLevel = thData.maxSpellFactory;
        } else if (prod == 'Dark Spell Factory') {
          prodLevel = thData.maxDarkSpellFactory;
        }
        
        if (prodLevel == null) {
          throw Exception('Unrecognized production building "$prod" for spell "$name"');
        }
        // 检查是否通过法术工厂解锁
        if ((levelData.spellFactoryLevel ?? -1) > prodLevel) {
          return maxLevel;
        }
      }

      // 检查等级是否通过实验室解锁（1级默认可用）
      final labLevel = thData.maxLaboratory ?? -1;
      if (level != 1 && (levelData.laboratoryLevel ?? -1) > labLevel) {
        return maxLevel;
      }

      if (type == UnitType.troop && unit.isSuper) {
        // 超级兵在大本营11级解锁
        if (thData.level < 11) {
          return maxLevel;
        }
        // 如果超级兵解锁，等级匹配普通兵种版本的最大等级
        final regularTroopVersion = gameData.units.where((x) => 
            x.type == UnitType.troop && x.name == _getSuperToRegular(name)
        ).firstOrNull;
        if (regularTroopVersion == null) {
          throw Exception('Expected to find regular troop version for "$name"');
        }
        final regularMaxLevel = getMaxLevel(regularTroopVersion, townHall, gameData);
        if (level > regularMaxLevel) {
          // 某些超级兵必须有其对应的普通兵种解锁到一定等级
          return maxLevel;
        }
        return regularMaxLevel;
      }

      maxLevel = level;
    }

    return maxLevel;
  }

  /// 获取部落城堡中单位最大等级
  static int getMaxCcLevel(Unit unit, int townHall, StaticGameData gameData) {
    final thData = _requireTownHall(townHall, gameData);
    final name = unit.name;
    final type = unit.type;

    if (thData.maxCc == null || (name == 'Battle Drill' && thData.maxCc! < 9)) {
      return -1;
    }

    int maxLevel = -1;

    for (final levelData in unit.levels) {
      final level = levelData.level;

      // 检查等级是否基于实验室等级上限可用
      final labLevel = thData.ccLaboratoryCap;
      if (levelData.laboratoryLevel != null && levelData.laboratoryLevel! > labLevel) {
        return maxLevel;
      }

      if (type == UnitType.troop && unit.isSuper) {
        // 超级兵在大本营11级解锁
        if (thData.level < 11) {
          return maxLevel;
        }
        // 如果超级兵解锁，等级匹配普通兵种版本允许的最大等级
        final regularTroopVersion = gameData.units.where((x) => 
            x.type == UnitType.troop && x.name == _getSuperToRegular(name)
        ).firstOrNull;
        if (regularTroopVersion == null) {
          throw Exception('Expected to find regular troop version for "$name"');
        }

        // 超级兵要能被捐赠，实验室必须足够高以提升普通兵种
        final regularMaxLevel = getMaxLevel(regularTroopVersion, townHall, gameData);
        if (level > regularMaxLevel) return maxLevel;

        // 如果实验室足够高以提升普通兵种，使用普通兵种的最大等级
        return getMaxCcLevel(regularTroopVersion, townHall, gameData);
      }

      maxLevel = level;
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

  /// 超级兵到普通兵的映射
  static String _getSuperToRegular(String superName) {
    const superToRegular = {
      'Super Barbarian': 'Barbarian',
      'Super Archer': 'Archer',
      'Sneaky Goblin': 'Goblin',
      'Super Wall Breaker': 'Wall Breaker',
      'Super Giant': 'Giant',
      'Rocket Balloon': 'Balloon',
      'Super Wizard': 'Wizard',
      'Super Dragon': 'Dragon',
      'Inferno Dragon': 'Baby Dragon',
      'Super Minion': 'Minion',
      'Super Valkyrie': 'Valkyrie',
      'Super Witch': 'Witch',
      'Ice Hound': 'Lava Hound',
      'Super Bowler': 'Bowler',
      'Super Miner': 'Miner',
      'Super Hog Rider': 'Hog Rider',
      'Super Yeti': 'Yeti',
    };
    return superToRegular[superName] ?? superName;
  }
}
