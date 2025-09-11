// 使用示例
// 展示如何使用 GameUtils 类

import 'models.dart';

void main() {
  // 假设你已经有了游戏数据
  final gameData = StaticGameData(
    units: [], // 从 API 加载的单位数据
    townHalls: [], // 从 API 加载的大本营数据
    equipment: [], // 从 API 加载的装备数据
    pets: [], // 从 API 加载的宠物数据
  );

  // 创建一个军队
  final army = ArmyModel.create(gameData);
  army.name = "我的测试军队";
  army.townHall = 15;

  // 添加一些单位（假设你已经有了单位数据）
  // final barbarian = gameData.units.firstWhere((u) => u.name == "Barbarian");
  // army.addUnit(barbarian, UnitHome.armyCamp, amount: 20);

  // 生成军队链接
  final armyLink = GameUtils.generateLink(army);
  print("生成的军队链接: $armyLink");

  // 解析军队链接
  try {
    final parsedArmy = GameUtils.parseLink(armyLink, gameData);
    print("解析的军队名称: ${parsedArmy.name}");
    print("解析的单位数量: ${parsedArmy.units.length}");
  } catch (e) {
    print("解析失败: $e");
  }

  // 获取军队标签
  final tags = GameUtils.getTags(army);
  print("军队标签: ${tags.map((t) => t['label']).join(', ')}");

  // 生成军队描述
  final description = GameUtils.generateArmyDescription(army);
  print("军队描述: $description");

  // 验证链接格式
  final isValid = GameUtils.isValidArmyLink(armyLink);
  print("链接是否有效: $isValid");

  // 获取按钮标题
  final copyTitle = GameUtils.getCopyBtnTitle(army);
  final openTitle = GameUtils.getOpenBtnTitle(army);
  print("复制按钮标题: $copyTitle");
  print("打开按钮标题: $openTitle");
}

/// 在 Flutter 中使用的示例
class ArmyLinkExample {
  final StaticGameData gameData;

  ArmyLinkExample(this.gameData);

  /// 生成并复制军队链接
  Future<void> copyArmyLink(ArmyModel army) async {
    try {
      final link = GameUtils.generateLink(army);
      await GameUtils.copy(link);
      // 显示成功通知
      print("军队链接已复制到剪贴板");
    } catch (e) {
      // 显示错误通知
      print("复制失败: $e");
    }
  }

  /// 在游戏中打开军队
  void openArmyInGame(ArmyModel army) {
    try {
      GameUtils.openInGame(army);
    } catch (e) {
      print("打开失败: $e");
    }
  }

  /// 从链接导入军队
  ArmyModel? importArmyFromLink(String link) {
    try {
      if (!GameUtils.isValidArmyLink(link)) {
        throw Exception("无效的军队链接格式");
      }
      
      return GameUtils.parseLink(link, gameData);
    } catch (e) {
      print("导入军队失败: $e");
      return null;
    }
  }

  /// 获取军队分享信息
  Map<String, dynamic> getArmyShareInfo(ArmyModel army) {
    return {
      'link': GameUtils.generateLink(army),
      'description': GameUtils.generateArmyDescription(army),
      'tags': GameUtils.getTags(army),
      'canShare': army.units.isNotEmpty || 
                  army.ccUnits.isNotEmpty || 
                  army.pets.isNotEmpty || 
                  army.equipment.isNotEmpty,
    };
  }
}
