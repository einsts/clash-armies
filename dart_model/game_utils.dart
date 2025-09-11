// 游戏工具类
// 对应前端的 src/lib/client/army.ts
// 主要用于解析和生成 Clash of Clans 军队链接

import 'models.dart';

/// 游戏工具类
class GameUtils {
  /// 英雄 Clash ID 映射
  static const Map<String, int> heroClashIds = {
    'Barbarian King': 0,
    'Archer Queen': 1,
    'Grand Warden': 2,
    'Royal Champion': 4,
    'Minion Prince': 6,
  };

  /// 军队链接分隔符正则表达式
  static final RegExp armyLinkSeparator = RegExp(
    r'h(?<heroes>[^idus]+)|i(?<castle_units>[\d+x-]+)|d(?<castle_spells>[\d+x-]+)|u(?<units>[\d+x-]+)|s(?<spells>[\d+x-]+)',
    multiLine: true,
  );

  /// 英雄模式正则表达式
  static final RegExp armyLinkHeroPattern = RegExp(
    r'(?<hero_id>\d+)(?:m\d+)?(?:p(?<pet_id>\d+))?(?:e(?<eq1>\d+)(?:_(?<eq2>\d+))?)?',
    multiLine: true,
  );

  /// 生成军队链接
  /// 
  /// 示例: https://link.clashofclans.com/en?action=CopyArmy&army=u10x0-2x3s1x9-3x2
  static String generateLink(ArmyModel army) {
    String url = 'https://link.clashofclans.com/?action=CopyArmy&army=';

    // 筛选不同类型的单位
    final selectedTroops = army.units
        .where((item) => item.info.type == UnitType.troop || item.info.type == UnitType.siege)
        .toList();
    final selectedSpells = army.units
        .where((item) => item.info.type == UnitType.spell)
        .toList();
    final selectedCCTroops = army.ccUnits
        .where((item) => item.info.type == UnitType.troop || item.info.type == UnitType.siege)
        .toList();
    final selectedCCSpells = army.ccUnits
        .where((item) => item.info.type == UnitType.spell)
        .toList();

    // 构建英雄数据
    final Map<String, Map<String, dynamic>> heroes = {};
    
    // 处理装备
    for (final eq in army.equipment) {
      final hero = eq.info.hero.value;
      if (!heroes.containsKey(hero)) {
        heroes[hero] = {};
      }
      if (heroes[hero]!['eq1'] == null) {
        heroes[hero]!['eq1'] = eq;
      } else if (heroes[hero]!['eq2'] == null) {
        heroes[hero]!['eq2'] = eq;
      }
    }

    // 处理宠物
    for (final pet in army.pets) {
      final hero = pet.hero.value;
      if (!heroes.containsKey(hero)) {
        heroes[hero] = {};
      }
      if (heroes[hero]!['pet'] == null) {
        heroes[hero]!['pet'] = pet;
      }
    }

    // 生成英雄部分
    if (heroes.isNotEmpty) {
      url += 'h';
      url += _buildHeroesStr(heroes);
    }

    // 生成部落城堡兵种
    if (selectedCCTroops.isNotEmpty) {
      url += 'i';
      url += _buildUnitStr(selectedCCTroops);
    }

    // 生成部落城堡法术
    if (selectedCCSpells.isNotEmpty) {
      url += 'd';
      url += _buildUnitStr(selectedCCSpells);
    }

    // 生成兵种
    if (selectedTroops.isNotEmpty) {
      url += 'u';
      url += _buildUnitStr(selectedTroops);
    }

    // 生成法术
    if (selectedSpells.isNotEmpty) {
      url += 's';
      url += _buildUnitStr(selectedSpells);
    }

    return url;
  }

  /// 构建单位字符串
  static String _buildUnitStr(List<UnitModel> units) {
    return units
        .map((unit) => '${unit.amount}x${unit.info.clashId}')
        .join('-');
  }

  /// 构建英雄字符串
  static String _buildHeroesStr(Map<String, Map<String, dynamic>> heroes) {
    return heroes.entries
        .map((entry) {
          final name = entry.key;
          final hero = entry.value;
          final clashId = heroClashIds[name]!;
          String heroStr = clashId.toString();

          // 添加宠物
          if (hero['pet'] != null) {
            final pet = hero['pet'] as PetModel;
            heroStr += 'p${pet.info.clashId}';
          }

          // 添加装备
          if (hero['eq1'] != null || hero['eq2'] != null) {
            final firstEq = hero['eq1'] ?? hero['eq2'];
            final secondEq = firstEq == hero['eq1'] ? hero['eq2'] : hero['eq1'];
            
            if (firstEq != null) {
              heroStr += 'e${(firstEq as EquipmentModel).info.clashId}';
            }
            if (secondEq != null) {
              heroStr += '_${(secondEq as EquipmentModel).info.clashId}';
            }
          }

          return heroStr;
        })
        .join('-');
  }

  /// 解析军队链接
  /// 
  /// 将 Clash of Clans 军队链接解析为 ArmyModel
  static ArmyModel parseLink(String fullLink, StaticGameData gameData) {
    final uri = Uri.parse(fullLink);
    final link = uri.queryParameters['army'];
    
    if (link == null) {
      throw Exception('Import link "$fullLink" is invalid');
    }

    final model = ArmyModel.create(gameData);

    // 解析单位数据
    List<Map<String, int>> parseUnits(String data) {
      return data
          .split('-')
          .where((item) => item.isNotEmpty)
          .map((item) {
            final parts = item.split('x');
            return {
              'amount': int.parse(parts[0]),
              'id': int.parse(parts[1]),
            };
          })
          .toList();
    }

    // 添加单位
    void addUnit(Map<String, int> data, UnitType type, UnitHome housedIn) {
      if (type == UnitType.troop) {
        final unit = UnitModel.requireTroopByClashID(data['id']!, gameData);
        final modelUnit = model.addUnit(unit, housedIn);
        modelUnit.amount = data['amount']!;
      } else if (type == UnitType.spell) {
        final unit = UnitModel.requireSpellByClashID(data['id']!, gameData);
        final modelUnit = model.addUnit(unit, housedIn);
        modelUnit.amount = data['amount']!;
      }
    }

    // 解析链接
    final matches = armyLinkSeparator.allMatches(link);
    
    for (final match in matches) {
      final heroes = match.namedGroup('heroes');
      final castleUnits = match.namedGroup('castle_units');
      final castleSpells = match.namedGroup('castle_spells');
      final units = match.namedGroup('units');
      final spells = match.namedGroup('spells');

      if (heroes != null) {
        for (final hero in heroes.split('-').where((h) => h.isNotEmpty)) {
          final heroMatch = armyLinkHeroPattern.firstMatch(hero);
          if (heroMatch != null) {
            final heroId = heroMatch.namedGroup('hero_id');
            final petId = heroMatch.namedGroup('pet_id');
            final eq1 = heroMatch.namedGroup('eq1');
            final eq2 = heroMatch.namedGroup('eq2');

            if (heroId != null) {
              final heroName = heroClashIds.entries
                  .where((entry) => entry.value == int.parse(heroId))
                  .map((entry) => entry.key)
                  .firstOrNull;

              if (heroName == null) {
                throw Exception('Invalid hero ID');
              }

              // 添加宠物
              if (petId != null) {
                final pet = PetModel.requireByClashID(int.parse(petId), gameData);
                model.addPet(pet, HeroType.values.firstWhere((h) => h.value == heroName));
              }

              // 添加装备1
              if (eq1 != null) {
                final equipment = EquipmentModel.requireByClashID(int.parse(eq1), gameData);
                if (equipment.hero.value != heroName) {
                  throw Exception('Hero mismatch "${equipment.hero.value}" and "$heroName"');
                }
                model.addEquipment(equipment);
              }

              // 添加装备2
              if (eq2 != null) {
                final equipment = EquipmentModel.requireByClashID(int.parse(eq2), gameData);
                if (equipment.hero.value != heroName) {
                  throw Exception('Hero mismatch "${equipment.hero.value}" and "$heroName"');
                }
                model.addEquipment(equipment);
              }
            }
          }
        }
      } else if (castleUnits != null) {
        parseUnits(castleUnits).forEach((unit) => addUnit(unit, UnitType.troop, UnitHome.clanCastle));
      } else if (castleSpells != null) {
        parseUnits(castleSpells).forEach((unit) => addUnit(unit, UnitType.spell, UnitHome.clanCastle));
      } else if (units != null) {
        parseUnits(units).forEach((unit) => addUnit(unit, UnitType.troop, UnitHome.armyCamp));
      } else if (spells != null) {
        parseUnits(spells).forEach((unit) => addUnit(unit, UnitType.spell, UnitHome.armyCamp));
      }
    }

    // 处理攻城机器（只保留第一个）
    final firstSiege = model.units.where((u) => u.info.type == UnitType.siege).firstOrNull;
    if (firstSiege != null) {
      model.units.removeWhere((u) => u.info.type == UnitType.siege && u != firstSiege);
      firstSiege.amount = 1;
    }

    return model;
  }

  /// 打开链接
  static void openLink(String href, {bool openInNewTab = true}) {
    // 在 Flutter 中，这通常通过 url_launcher 包实现
    // 这里只是示例，实际使用时需要集成 url_launcher
    throw UnimplementedError('openLink requires url_launcher package integration');
  }

  /// 复制文本到剪贴板
  static Future<void> copy(String text) async {
    // 在 Flutter 中，这通常通过 flutter/services 的 Clipboard 实现
    // 这里只是示例，实际使用时需要导入 flutter/services
    throw UnimplementedError('copy requires flutter/services integration');
  }

  /// 复制军队链接
  static Future<void> copyLink(ArmyModel army) async {
    final link = generateLink(army);
    await copy(link);
    // 这里可以添加通知逻辑
  }

  /// 在游戏中打开
  static void openInGame(ArmyModel army) {
    final link = generateLink(army);
    openLink(link);
  }

  /// 获取军队标签
  static List<Map<String, dynamic>> getTags(ArmyModel army) {
    final armyStats = army.getStats();
    final List<Map<String, dynamic>> tags = [];
    
    tags.add({'label': 'TH${army.townHall}'});
    tags.add({'label': armyStats['type']});
    
    if (armyStats['hasGuide'] == true) {
      tags.add({'label': 'Guide'});
    }
    
    for (final tag in army.tags) {
      tags.add({'label': tag});
    }
    
    return tags;
  }

  /// 获取复制按钮标题
  static String getCopyBtnTitle(ArmyModel army) {
    if (army.units.isNotEmpty || 
        army.ccUnits.isNotEmpty || 
        army.pets.isNotEmpty || 
        army.equipment.isNotEmpty) {
      return "Copies an army link to your clipboard for sharing.\nNote: may not work in game if the army isn't at full capacity";
    }
    return 'Army cannot be shared when empty';
  }

  /// 获取打开按钮标题
  static String getOpenBtnTitle(ArmyModel army) {
    if (army.units.isNotEmpty || 
        army.ccUnits.isNotEmpty || 
        army.pets.isNotEmpty || 
        army.equipment.isNotEmpty) {
      return "Opens clash of clans and allows you to paste your army in one of your slots.\nNote: may not work in game if the army isn't at full capacity";
    }
    return 'Army cannot be opened in-game when empty';
  }

  /// 验证军队链接格式
  static bool isValidArmyLink(String link) {
    try {
      final uri = Uri.parse(link);
      return uri.host.contains('clashofclans.com') && 
             uri.queryParameters.containsKey('army');
    } catch (e) {
      return false;
    }
  }

  /// 从链接中提取军队数据
  static String? extractArmyData(String link) {
    try {
      final uri = Uri.parse(link);
      return uri.queryParameters['army'];
    } catch (e) {
      return null;
    }
  }

  /// 生成简化的军队描述
  static String generateArmyDescription(ArmyModel army) {
    final stats = army.getStats();
    final unitCount = army.units.length + army.ccUnits.length;
    final heroCount = army.equipment.length + army.pets.length;
    
    final parts = <String>[];
    parts.add('TH${army.townHall}');
    parts.add(stats['type'] as String);
    parts.add('${unitCount} units');
    
    if (heroCount > 0) {
      parts.add('$heroCount heroes');
    }
    
    if (army.guide != null) {
      parts.add('with guide');
    }
    
    return parts.join(' • ');
  }
}
