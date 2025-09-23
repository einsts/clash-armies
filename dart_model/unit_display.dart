import 'types.dart';

/// 显示模式枚举
enum DisplayMode {
  inline,
  block,
}

class UnitDisplayWidget extends StatelessWidget {
  final Unit unit;
  final StaticGameData gameData;
  final bool removable;
  final VoidCallback? onRemove;
  final double width;
  final double height;
  final int? level;
  final int? amount;
  final String? title;
  final DisplayMode display;

  const UnitDisplayWidget({
    super.key,
    required this.unit,
    required this.gameData,
    this.removable = false,
    this.onRemove,
    this.width = 56,
    this.height = 74.5,
    this.level,
    this.amount,
    this.title,
    this.display = DisplayMode.inline,
  });

  @override
  Widget build(BuildContext context) {
    // 获取单位的完整等级信息，与 Svelte 版本保持一致
    final levels = gameData.units
        .where((u) => u.name == unit.name)
        .firstOrNull
        ?.levels ?? <UnitLevel>[];

    return GestureDetector(
      onTap: removable ? onRemove : null,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          gradient: _getBackgroundGradient(),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Stack(
          children: [
            Column(
              children: [
                // 数量显示（仅在 inline 模式下显示在顶部）
                if (display == DisplayMode.inline && amount != null && amount! > 1)
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.black45.withValues(alpha: 0.10),
                      ),
                      child: Center(
                        child: Text(
                          'x$amount',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: width * 0.25,
                            fontWeight: FontWeight.w900,
                            fontFamily: 'Clash',
                            shadows: const [
                              Shadow(
                                color: Colors.black,
                                blurRadius: 2,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),

                // 单位图片
                Expanded(
                  child: Center(
                    child: Image.asset(
                      _getImagePath(),
                      width: width,
                      height: width,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: width,
                          height: width,
                          decoration: BoxDecoration(
                            color: AppColors.backgroundLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                _getUnitTypeIcon(unit.type),
                                size: width * 0.4,
                                color: AppColors.textSecondary,
                              ),
                              const SizedBox(height: 2),
                              Text(
                                unit.name.substring(0, 1),
                                style: TextStyle(
                                  fontSize: width * 0.2,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ),

                // 数量显示（block 模式下显示在底部）
                if (display == DisplayMode.block && amount != null && amount! > 1)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 3, horizontal: 0),
                    decoration: BoxDecoration(
                      gradient: _getAmountBackgroundGradient(),
                    ),
                    child: Center(
                      child: Text(
                        'x$amount',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: width * 0.2,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'Clash',
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // 等级标识（如果需要显示）
            if (_shouldShowLevel())
              Positioned(
                bottom: 4,
                left: 4,
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: width * 0.08,
                    vertical: width * 0.04,
                  ),
                  decoration: BoxDecoration(
                    color: _isMaxLevel()
                        ? const Color(0xFFf5ab3d)
                        : AppColors.backgroundDark,
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 2,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Text(
                    '${_getUnitLevel()}',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: width * 0.2,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Clash',
                      shadows: const [
                        Shadow(
                          color: Colors.black,
                          blurRadius: 2,
                          offset: Offset(0, 1),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

            // 超级兵种标识
            if (unit.isSuper)
              Positioned(
                bottom: 4,
                right: 4,
                child: Container(
                  padding: EdgeInsets.all(width * 0.04),
                  decoration: BoxDecoration(
                    color: Colors.red.shade700,
                    borderRadius: BorderRadius.circular(width * 0.2),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 2,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Icon(
                    Icons.star,
                    size: width * 0.2,
                    color: Colors.white,
                  ),
                ),
              ),
            
          ],
        ),
      ),
    );
  }

  IconData _getUnitTypeIcon(UnitType type) {
    switch (type) {
      case UnitType.troop:
        return Icons.person;
      case UnitType.spell:
        return Icons.auto_fix_high;
      case UnitType.siege:
        return Icons.engineering;
    }
  }

  /// 获取背景渐变
  LinearGradient _getBackgroundGradient() {
    if (unit.isSuper) {
      return const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF8B1A1A), // 深红色
          Color(0xFFCC0A0A), // 亮红色
        ],
      );
    }
    
    switch (unit.type) {
      case UnitType.troop:
      case UnitType.siege:
        return const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF3D6BA4), // 深蓝色
            Color(0xFF4A92D2), // 亮蓝色
          ],
        );
      case UnitType.spell:
        return const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF4D3EA7), // 深紫色
            Color(0xFF7D5DE2), // 亮紫色
          ],
        );
    }
  }

  /// 获取图片路径
  String _getImagePath() {
    return 'assets/units/${unit.name}_small.webp';
  }

  /// 是否应该显示等级
  bool _shouldShowLevel() {
    return level != null && level! > 0;
  }

  /// 是否为最大等级
  bool _isMaxLevel() {
    if (level == null) return false;
    
    // 从全局游戏数据中查找对应单位的完整等级信息
    final levels = gameData.units
        .where((u) => u.name == unit.name)
        .firstOrNull
        ?.levels ?? <UnitLevel>[];
    
    final maxLevel = levels.isNotEmpty 
        ? levels.map((l) => l.level).reduce((a, b) => a > b ? a : b)
        : 1;
        
    return level == maxLevel;
  }

  /// 获取单位等级
  int _getUnitLevel() {
    return level ?? 1;
  }

  /// 获取数量背景渐变
  LinearGradient _getAmountBackgroundGradient() {
    if (unit.isSuper) {
      return const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [
          Color(0xFF722831), // 深红色
          Color(0xFF850D13), // 亮红色
        ],
      );
    }
    
    switch (unit.type) {
      case UnitType.troop:
      case UnitType.siege:
        return const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF396EA4), // 深蓝色
            Color(0xFF4E92D2), // 亮蓝色
          ],
        );
      case UnitType.spell:
        return const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Color(0xFF4D3EA7), // 深紫色
            Color(0xFF7D5DE2), // 亮紫色
          ],
        );
    }
  }
}
