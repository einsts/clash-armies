// 工具类和常量
// 对应前端的 src/lib/shared/utils.ts

/// 超级兵到普通兵的映射
const Map<String, String> superToRegular = {
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

/// 军队编辑填充数量
const int armyEditFiller = 14;

/// 按住添加速度（毫秒）
const int holdAddSpeed = 150;

/// 按住移除速度（毫秒）
const int holdRemoveSpeed = 150;

/// 时间常量
const int second = 1000;
const int minute = second * 60;
const int hour = minute * 60;
const int day = hour * 24;
const int year = day * 365;

/// 军队标签
const List<String> armyTags = [
  'CWL/War',
  'Legends League',
  'Farming',
  'Beginner Friendly',
  'Spam'
];

/// 用户最大军队数量
const int userMaxArmies = 40;

/// 有效单位归属位置
const List<String> validUnitHome = ['armyCamp', 'clanCastle'];

/// 有效英雄类型
const List<String> validHeroes = [
  'Barbarian King',
  'Archer Queen',
  'Grand Warden',
  'Royal Champion',
  'Minion Prince'
];

/// 攻略文本字符限制
const int guideTextCharLimit = 3000;

/// YouTube URL 正则表达式
final RegExp youtubeUrlRegex = RegExp(
  r'^(?:https:\/\/)?(?:www\.)?youtube\.com\/watch\?(?=.*v=((\w|-){11}))(?:\S+)?$'
);

/// 最大评论长度
const int maxCommentLength = 2000;

/// 最大军队标签数量
const int maxArmyTags = 3;

/// 页面浏览指标
const String pageViewMetric = 'page-view';

/// 复制链接点击指标
const String copyLinkClickMetric = 'copy-link-click';

/// 打开链接点击指标
const String openLinkClickMetric = 'open-link-click';

/// 英雄 Clash ID 映射
const Map<String, int> heroClashIds = {
  'Barbarian King': 0,
  'Archer Queen': 1,
  'Grand Warden': 2,
  'Royal Champion': 4,
  'Minion Prince': 6,
};

/// 工具类
class Utils {
  /// 复数化字符串
  static String pluralize(String string, int count, {String suffix = 's'}) {
    return '$string${count != 1 ? suffix : ''}';
  }

  /// 防抖函数
  static void Function() debounce(void Function() fn, int ms) {
    int? timeoutId;
    
    return () {
      if (timeoutId != null) {
        // 在 Flutter 中，我们需要使用 Timer 来实现防抖
        // 这里返回一个简单的函数，实际使用时需要配合 Timer
        fn();
      }
    };
  }

  /// 获取超级兵对应的普通兵
  static String getSuperToRegular(String superName) {
    return superToRegular[superName] ?? superName;
  }

  /// 验证 YouTube URL
  static bool isValidYouTubeUrl(String url) {
    return youtubeUrlRegex.hasMatch(url);
  }

  /// 获取 YouTube 嵌入 URL
  static String? getYouTubeEmbedUrl(String url) {
    final match = youtubeUrlRegex.firstMatch(url);
    if (match == null || match.group(1) == null) {
      return null;
    }
    final videoId = match.group(1)!;
    return 'https://www.youtube.com/embed/$videoId';
  }

  /// 格式化时间
  static String formatTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 365) {
      return '${(difference.inDays / 365).floor()}年前';
    } else if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()}个月前';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}天前';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}小时前';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}分钟前';
    } else {
      return '刚刚';
    }
  }

  /// 格式化数字（添加千分位分隔符）
  static String formatNumber(int number) {
    final String numberStr = number.toString();
    final StringBuffer result = StringBuffer();
    
    for (int i = 0; i < numberStr.length; i++) {
      if (i > 0 && (numberStr.length - i) % 3 == 0) {
        result.write(',');
      }
      result.write(numberStr[i]);
    }
    
    return result.toString();
  }

  /// 截断字符串
  static String truncate(String text, int maxLength, {String suffix = '...'}) {
    if (text.length <= maxLength) {
      return text;
    }
    return '${text.substring(0, maxLength)}$suffix';
  }

  /// 验证军队名称
  static bool isValidArmyName(String name) {
    return name.length >= 2 && name.length <= 25;
  }

  /// 验证评论内容
  static bool isValidComment(String comment) {
    return comment.isNotEmpty && comment.length <= maxCommentLength;
  }

  /// 生成随机 ID
  static String generateId() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }

  /// 深度复制 Map
  static Map<String, dynamic> deepCopyMap(Map<String, dynamic> map) {
    final Map<String, dynamic> copy = {};
    map.forEach((key, value) {
      if (value is Map<String, dynamic>) {
        copy[key] = deepCopyMap(value);
      } else if (value is List) {
        copy[key] = List.from(value);
      } else {
        copy[key] = value;
      }
    });
    return copy;
  }

  /// 检查列表是否为空或 null
  static bool isEmptyOrNull(List? list) {
    return list?.isEmpty ?? true;
  }

  /// 安全获取列表元素
  static T? safeGet<T>(List<T> list, int index) {
    if (index >= 0 && index < list.length) {
      return list[index];
    }
    return null;
  }

  /// 移除列表中的重复元素
  static List<T> removeDuplicates<T>(List<T> list) {
    return list.toSet().toList();
  }

  /// 按条件过滤列表
  static List<T> filter<T>(List<T> list, bool Function(T) predicate) {
    return list.where(predicate).toList();
  }

  /// 按条件查找第一个元素
  static T? find<T>(List<T> list, bool Function(T) predicate) {
    try {
      return list.firstWhere(predicate);
    } catch (e) {
      return null;
    }
  }

  /// 按条件查找所有元素
  static List<T> findAll<T>(List<T> list, bool Function(T) predicate) {
    return list.where(predicate).toList();
  }

  /// 将列表按指定大小分组
  static List<List<T>> chunk<T>(List<T> list, int size) {
    final List<List<T>> chunks = [];
    for (int i = 0; i < list.length; i += size) {
      chunks.add(list.sublist(i, i + size > list.length ? list.length : i + size));
    }
    return chunks;
  }

  /// 计算列表元素的总和
  static int sum(List<int> list) {
    return list.fold(0, (sum, element) => sum + element);
  }

  /// 计算列表元素的平均值
  static double average(List<int> list) {
    if (list.isEmpty) return 0.0;
    return sum(list) / list.length;
  }

  /// 获取列表中的最大值
  static T? max<T extends Comparable<T>>(List<T> list) {
    if (list.isEmpty) return null;
    return list.reduce((a, b) => a.compareTo(b) > 0 ? a : b);
  }

  /// 获取列表中的最小值
  static T? min<T extends Comparable<T>>(List<T> list) {
    if (list.isEmpty) return null;
    return list.reduce((a, b) => a.compareTo(b) < 0 ? a : b);
  }
}
