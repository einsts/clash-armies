// GuideModel 类
// 对应前端的 src/lib/models/Guide.svelte.ts

import 'types.dart';
import 'army_data.dart';

/// 攻略模型类
class GuideModel {
  final StaticGameData gameData;
  final int? id;
  final DateTime? createdTime;
  final DateTime? updatedTime;
  String? textContent;
  String? youtubeUrl;

  GuideModel({
    required this.gameData,
    this.id,
    this.createdTime,
    this.updatedTime,
    this.textContent,
    this.youtubeUrl,
  });

  /// 从 ArmyGuide 创建 GuideModel
  factory GuideModel.fromArmyGuide(StaticGameData gameData, ArmyGuide data) {
    return GuideModel(
      gameData: gameData,
      id: data.id,
      createdTime: data.createdTime,
      updatedTime: data.updatedTime,
      textContent: data.textContent,
      youtubeUrl: data.youtubeUrl,
    );
  }

  /// 创建新的攻略
  factory GuideModel.create(StaticGameData gameData) {
    return GuideModel(
      gameData: gameData,
      textContent: null,
      youtubeUrl: null,
    );
  }

  /// 获取保存数据
  ArmyGuide getSaveData() {
    return ArmyGuide(
      id: id,
      textContent: textContent,
      youtubeUrl: youtubeUrl,
      createdTime: createdTime,
      updatedTime: updatedTime,
    );
  }

  /// 计算字符数（简化版本，不包含 HTML 解析）
  /// 在 Flutter 中，通常使用 TextEditingController 来获取文本长度
  static int countCharacters(String text) {
    return text.length;
  }

  /// 验证 YouTube URL
  static bool isValidYouTubeUrl(String url) {
    final regex = RegExp(r'^(?:https:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$');
    return regex.hasMatch(url);
  }

  /// 获取 YouTube 嵌入 URL
  static String? getYouTubeEmbedUrl(String url) {
    final regex = RegExp(r'^(?:https:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$');
    final match = regex.firstMatch(url);
    if (match == null || match.group(1) == null) {
      return null;
    }
    final videoId = match.group(1)!;
    return 'https://www.youtube.com/embed/$videoId';
  }

  /// 检查攻略是否有效
  bool get isValid {
    return (textContent != null && textContent!.isNotEmpty) || 
           (youtubeUrl != null && youtubeUrl!.isNotEmpty);
  }

  /// 检查是否有文本内容
  bool get hasTextContent {
    return textContent != null && textContent!.isNotEmpty;
  }

  /// 检查是否有 YouTube 视频
  bool get hasYouTubeUrl {
    return youtubeUrl != null && youtubeUrl!.isNotEmpty;
  }
}
