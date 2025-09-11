# Clash Armies Dart 模型

这是 Clash of Clans 军队管理应用的 Dart 模型库，完全对应前端 TypeScript 版本的 ArmyModel 及其子模型。

## 文件结构

```
dart_model/
├── types.dart           # 基础类型和枚举定义
├── army_data.dart       # 军队相关数据结构
├── unit_model.dart      # 单位模型类
├── pet_model.dart       # 宠物模型类
├── equipment_model.dart # 装备模型类
├── guide_model.dart     # 攻略模型类
├── comment_model.dart   # 评论模型类
├── army_model.dart      # 军队主模型类
├── utils.dart           # 工具类和常量
├── game_utils.dart      # 游戏工具类（链接生成和解析）
├── example_usage.dart   # 使用示例
├── models.dart          # 统一导出文件
└── README.md           # 说明文档
```
## 模型类
```
数据层 (Data Layer)
├── Unit (游戏数据)           # 静态游戏数据中的单位定义
├── Pet (游戏数据)            # 静态游戏数据中的宠物定义  
├── Equipment (游戏数据)      # 静态游戏数据中的装备定义
└── Army (API数据)           # 从服务器获取的军队数据

业务层 (Business Layer)  
├── ArmyUnit (数据传输)       # 军队中的单位实例数据
├── ArmyPet (数据传输)        # 军队中的宠物实例数据
├── ArmyEquipment (数据传输)  # 军队中的装备实例数据
└── ArmyComment (数据传输)    # 军队中的评论数据

模型层 (Model Layer)
├── UnitModel (业务模型)      # 单位业务逻辑和状态管理
├── PetModel (业务模型)       # 宠物业务逻辑和状态管理
├── EquipmentModel (业务模型) # 装备业务逻辑和状态管理
├── CommentModel (业务模型)   # 评论业务逻辑和状态管理
└── ArmyModel (主模型)        # 军队主业务逻辑和状态管理
```

## 使用方法

### 1. 导入模型

```dart
import 'models.dart';
```

### 2. 创建军队模型

```dart
// 从 API 数据创建
final armyModel = ArmyModel.fromArmy(gameData, armyData);

// 创建新军队
final newArmy = ArmyModel.create(gameData);
newArmy.name = "我的军队";
newArmy.townHall = 15;
```

### 3. 管理军队组成

```dart
// 添加单位
final unit = gameData.units.firstWhere((u) => u.name == "Barbarian");
armyModel.addUnit(unit, UnitHome.armyCamp, amount: 20);

// 添加宠物
final pet = gameData.pets.firstWhere((p) => p.name == "L.A.S.S.I");
armyModel.addPet(pet, HeroType.archerQueen);

// 添加装备
final equipment = gameData.equipment.firstWhere((e) => e.name == "Invisibility Vial");
armyModel.addEquipment(equipment);
```

### 4. 获取军队信息

```dart
// 获取军队统计
final stats = armyModel.getStats();
print("军队类型: ${stats['type']}");
print("有部落城堡: ${stats['hasClanCastle']}");

// 获取容量信息
final capacity = armyModel.capacity;
print("兵种容量: ${capacity['troops']}");

// 获取已使用空间
final used = armyModel.housingSpaceUsed;
print("已使用空间: $used");
```

### 5. 管理评论

```dart
// 添加评论
final comment = CommentModel.create(gameData, comment: "这个军队很棒！");
armyModel.comments.add(comment);

// 结构化评论
final structured = CommentModel.structureComments(armyModel.comments);
```

### 6. 生成和解析军队链接

```dart
// 生成军队链接
final armyLink = GameUtils.generateLink(armyModel);
print("军队链接: $armyLink");

// 解析军队链接
final parsedArmy = GameUtils.parseLink(armyLink, gameData);

// 复制链接到剪贴板
await GameUtils.copyLink(armyModel);

// 在游戏中打开
GameUtils.openInGame(armyModel);
```

## 核心特性

### 1. 完全对应前端模型
- 所有类名、方法名、属性名都与 TypeScript 版本一致
- 保持相同的业务逻辑和计算方式
- 支持相同的数据验证规则

### 2. 响应式设计
- 使用 Dart 的 getter/setter 实现响应式更新
- 支持实时计算军队统计信息
- 自动更新相关数据

### 3. 类型安全
- 完整的类型定义和枚举
- 编译时类型检查
- 避免运行时错误

### 4. 易于扩展
- 模块化设计，易于添加新功能
- 清晰的继承和组合关系
- 支持自定义验证规则

## 主要模型类

### ArmyModel
军队的主模型类，管理所有军队相关数据：
- 军队基本信息（名称、大本营等级等）
- 军队组成（单位、宠物、装备）
- 社交功能（评论、投票、收藏）
- 攻略内容

### UnitModel
单位模型类，管理单个单位：
- 单位信息和属性
- 数量管理
- 等级计算
- 空间占用计算

### PetModel
宠物模型类，管理英雄宠物：
- 宠物信息
- 所属英雄
- 等级计算

### EquipmentModel
装备模型类，管理英雄装备：
- 装备信息
- 等级计算
- 英雄关联

### GuideModel
攻略模型类，管理军队攻略：
- 文本内容
- YouTube 视频
- 内容验证

### CommentModel
评论模型类，管理评论系统：
- 评论内容
- 回复关系
- 结构化显示

### GameUtils
游戏工具类，处理 Clash of Clans 军队链接：
- 生成军队链接
- 解析军队链接
- 链接验证
- 剪贴板操作
- 军队描述生成

## 注意事项

1. **数据一致性**: 确保传入的 `StaticGameData` 与前端使用的数据格式一致
2. **错误处理**: 所有模型方法都包含适当的错误处理
3. **性能优化**: 大量数据操作时注意内存使用
4. **线程安全**: 在多线程环境中使用时需要适当的同步机制

## 迁移到 Flutter 项目

1. 将整个 `dart_model` 文件夹复制到你的 Flutter 项目中
2. 在 `pubspec.yaml` 中添加必要的依赖（如果有的话）
3. 导入 `models.dart` 开始使用
4. 根据你的项目结构调整导入路径

## 版本兼容性

- Dart SDK: >=2.17.0
- Flutter: >=3.0.0
- 对应前端版本: 当前 TypeScript 版本

## 更新日志

- v1.0.0: 初始版本，完全对应前端 ArmyModel 功能
