// 基础类型定义
// 对应前端的 src/lib/shared/types.ts

/// 单位类型
enum UnitType {
  troop('Troop'),
  siege('Siege'),
  spell('Spell');

  const UnitType(this.value);
  final String value;
}

/// 单位归属位置
enum UnitHome {
  armyCamp('armyCamp'),
  clanCastle('clanCastle');

  const UnitHome(this.value);
  final String value;
}

/// 英雄类型
enum HeroType {
  barbarianKing('Barbarian King'),
  archerQueen('Archer Queen'),
  grandWarden('Grand Warden'),
  royalChampion('Royal Champion'),
  minionPrince('Minion Prince');

  const HeroType(this.value);
  final String value;
}

/// 大本营数据
class TownHall {
  final int level;
  final int maxBarracks;
  final int? maxDarkBarracks;
  final int? maxLaboratory;
  final int? maxSpellFactory;
  final int? maxDarkSpellFactory;
  final int? maxWorkshop;
  final int? maxCc;
  final int? maxBlacksmith;
  final int? maxPetHouse;
  final int? maxBarbarianKing;
  final int? maxArcherQueen;
  final int? maxGrandWarden;
  final int? maxRoyalChampion;
  final int? maxMinionPrince;
  final int troopCapacity;
  final int spellCapacity;
  final int siegeCapacity;
  final int ccLaboratoryCap;
  final int ccTroopCapacity;
  final int ccSpellCapacity;
  final int ccSiegeCapacity;

  const TownHall({
    required this.level,
    required this.maxBarracks,
    this.maxDarkBarracks,
    this.maxLaboratory,
    this.maxSpellFactory,
    this.maxDarkSpellFactory,
    this.maxWorkshop,
    this.maxCc,
    this.maxBlacksmith,
    this.maxPetHouse,
    this.maxBarbarianKing,
    this.maxArcherQueen,
    this.maxGrandWarden,
    this.maxRoyalChampion,
    this.maxMinionPrince,
    required this.troopCapacity,
    required this.spellCapacity,
    required this.siegeCapacity,
    required this.ccLaboratoryCap,
    required this.ccTroopCapacity,
    required this.ccSpellCapacity,
    required this.ccSiegeCapacity,
  });

  factory TownHall.fromJson(Map<String, dynamic> json) {
    return TownHall(
      level: json['level'] as int,
      maxBarracks: json['maxBarracks'] as int,
      maxDarkBarracks: json['maxDarkBarracks'] as int?,
      maxLaboratory: json['maxLaboratory'] as int?,
      maxSpellFactory: json['maxSpellFactory'] as int?,
      maxDarkSpellFactory: json['maxDarkSpellFactory'] as int?,
      maxWorkshop: json['maxWorkshop'] as int?,
      maxCc: json['maxCc'] as int?,
      maxBlacksmith: json['maxBlacksmith'] as int?,
      maxPetHouse: json['maxPetHouse'] as int?,
      maxBarbarianKing: json['maxBarbarianKing'] as int?,
      maxArcherQueen: json['maxArcherQueen'] as int?,
      maxGrandWarden: json['maxGrandWarden'] as int?,
      maxRoyalChampion: json['maxRoyalChampion'] as int?,
      maxMinionPrince: json['maxMinionPrince'] as int?,
      troopCapacity: json['troopCapacity'] as int,
      spellCapacity: json['spellCapacity'] as int,
      siegeCapacity: json['siegeCapacity'] as int,
      ccLaboratoryCap: json['ccLaboratoryCap'] as int,
      ccTroopCapacity: json['ccTroopCapacity'] as int,
      ccSpellCapacity: json['ccSpellCapacity'] as int,
      ccSiegeCapacity: json['ccSiegeCapacity'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'level': level,
      'maxBarracks': maxBarracks,
      'maxDarkBarracks': maxDarkBarracks,
      'maxLaboratory': maxLaboratory,
      'maxSpellFactory': maxSpellFactory,
      'maxDarkSpellFactory': maxDarkSpellFactory,
      'maxWorkshop': maxWorkshop,
      'maxCc': maxCc,
      'maxBlacksmith': maxBlacksmith,
      'maxPetHouse': maxPetHouse,
      'maxBarbarianKing': maxBarbarianKing,
      'maxArcherQueen': maxArcherQueen,
      'maxGrandWarden': maxGrandWarden,
      'maxRoyalChampion': maxRoyalChampion,
      'maxMinionPrince': maxMinionPrince,
      'troopCapacity': troopCapacity,
      'spellCapacity': spellCapacity,
      'siegeCapacity': siegeCapacity,
      'ccLaboratoryCap': ccLaboratoryCap,
      'ccTroopCapacity': ccTroopCapacity,
      'ccSpellCapacity': ccSpellCapacity,
      'ccSiegeCapacity': ccSiegeCapacity,
    };
  }
}

/// 单位等级数据
class UnitLevel {
  final int id;
  final int unitId;
  final int level;
  final int? spellFactoryLevel;
  final int? barrackLevel;
  final int? laboratoryLevel;

  const UnitLevel({
    required this.id,
    required this.unitId,
    required this.level,
    this.spellFactoryLevel,
    this.barrackLevel,
    this.laboratoryLevel,
  });

  factory UnitLevel.fromJson(Map<String, dynamic> json) {
    return UnitLevel(
      id: json['id'] as int,
      unitId: json['unitId'] as int,
      level: json['level'] as int,
      spellFactoryLevel: json['spellFactoryLevel'] as int?,
      barrackLevel: json['barrackLevel'] as int?,
      laboratoryLevel: json['laboratoryLevel'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'unitId': unitId,
      'level': level,
      'spellFactoryLevel': spellFactoryLevel,
      'barrackLevel': barrackLevel,
      'laboratoryLevel': laboratoryLevel,
    };
  }
}

/// 装备等级数据
class EquipmentLevel {
  final int equipmentId;
  final int level;
  final int? blacksmithLevel;

  const EquipmentLevel({
    required this.equipmentId,
    required this.level,
    this.blacksmithLevel,
  });

  factory EquipmentLevel.fromJson(Map<String, dynamic> json) {
    return EquipmentLevel(
      equipmentId: json['equipmentId'] as int,
      level: json['level'] as int,
      blacksmithLevel: json['blacksmithLevel'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'equipmentId': equipmentId,
      'level': level,
      'blacksmithLevel': blacksmithLevel,
    };
  }
}

/// 宠物等级数据
class PetLevel {
  final int id;
  final int petId;
  final int level;
  final int? petHouseLevel;

  const PetLevel({
    required this.id,
    required this.petId,
    required this.level,
    this.petHouseLevel,
  });

  factory PetLevel.fromJson(Map<String, dynamic> json) {
    return PetLevel(
      id: json['id'] as int,
      petId: json['petId'] as int,
      level: json['level'] as int,
      petHouseLevel: json['petHouseLevel'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'petId': petId,
      'level': level,
      'petHouseLevel': petHouseLevel,
    };
  }
}

/// 单位数据
class Unit {
  final int id;
  final UnitType type;
  final String name;
  final int clashId;
  final int housingSpace;
  final String productionBuilding;
  final bool isSuper;
  final bool isFlying;
  final bool isJumper;
  final bool airTargets;
  final bool groundTargets;
  final List<UnitLevel> levels;

  const Unit({
    required this.id,
    required this.type,
    required this.name,
    required this.clashId,
    required this.housingSpace,
    required this.productionBuilding,
    required this.isSuper,
    required this.isFlying,
    required this.isJumper,
    required this.airTargets,
    required this.groundTargets,
    required this.levels,
  });

  factory Unit.fromJson(Map<String, dynamic> json) {
    return Unit(
      id: json['id'] as int,
      type: UnitType.values.firstWhere((e) => e.value == json['type']),
      name: json['name'] as String,
      clashId: json['clashId'] as int,
      housingSpace: json['housingSpace'] as int,
      productionBuilding: json['productionBuilding'] as String,
      isSuper: json['isSuper'] as bool,
      isFlying: json['isFlying'] as bool,
      isJumper: json['isJumper'] as bool,
      airTargets: json['airTargets'] as bool,
      groundTargets: json['groundTargets'] as bool,
      levels: (json['levels'] as List<dynamic>)
          .map((e) => UnitLevel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.value,
      'name': name,
      'clashId': clashId,
      'housingSpace': housingSpace,
      'productionBuilding': productionBuilding,
      'isSuper': isSuper,
      'isFlying': isFlying,
      'isJumper': isJumper,
      'airTargets': airTargets,
      'groundTargets': groundTargets,
      'levels': levels.map((e) => e.toJson()).toList(),
    };
  }
}

/// 装备数据
class Equipment {
  final int id;
  final HeroType hero;
  final String name;
  final int clashId;
  final bool epic;
  final List<EquipmentLevel> levels;

  const Equipment({
    required this.id,
    required this.hero,
    required this.name,
    required this.clashId,
    required this.epic,
    required this.levels,
  });

  factory Equipment.fromJson(Map<String, dynamic> json) {
    return Equipment(
      id: json['id'] as int,
      hero: HeroType.values.firstWhere((e) => e.value == json['hero']),
      name: json['name'] as String,
      clashId: json['clashId'] as int,
      epic: json['epic'] as bool,
      levels: (json['levels'] as List<dynamic>)
          .map((e) => EquipmentLevel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hero': hero.value,
      'name': name,
      'clashId': clashId,
      'epic': epic,
      'levels': levels.map((e) => e.toJson()).toList(),
    };
  }
}

/// 宠物数据
class Pet {
  final int id;
  final String name;
  final int clashId;
  final List<PetLevel> levels;

  const Pet({
    required this.id,
    required this.name,
    required this.clashId,
    required this.levels,
  });

  factory Pet.fromJson(Map<String, dynamic> json) {
    return Pet(
      id: json['id'] as int,
      name: json['name'] as String,
      clashId: json['clashId'] as int,
      levels: (json['levels'] as List<dynamic>)
          .map((e) => PetLevel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'clashId': clashId,
      'levels': levels.map((e) => e.toJson()).toList(),
    };
  }
}

/// 静态游戏数据
class StaticGameData {
  final List<Unit> units;
  final List<TownHall> townHalls;
  final List<Equipment> equipment;
  final List<Pet> pets;

  const StaticGameData({
    required this.units,
    required this.townHalls,
    required this.equipment,
    required this.pets,
  });

  factory StaticGameData.fromJson(Map<String, dynamic> json) {
    return StaticGameData(
      units: (json['units'] as List<dynamic>)
          .map((e) => Unit.fromJson(e as Map<String, dynamic>))
          .toList(),
      townHalls: (json['townHalls'] as List<dynamic>)
          .map((e) => TownHall.fromJson(e as Map<String, dynamic>))
          .toList(),
      equipment: (json['equipment'] as List<dynamic>)
          .map((e) => Equipment.fromJson(e as Map<String, dynamic>))
          .toList(),
      pets: (json['pets'] as List<dynamic>)
          .map((e) => Pet.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'units': units.map((e) => e.toJson()).toList(),
      'townHalls': townHalls.map((e) => e.toJson()).toList(),
      'equipment': equipment.map((e) => e.toJson()).toList(),
      'pets': pets.map((e) => e.toJson()).toList(),
    };
  }
}

/// 横幅类型
enum Banner {
  fireAndIce('fire-and-ice'),
  samurai('samurai'),
  darkDays('dark-days'),
  bridge('bridge'),
  fireWarden('fire-warden'),
  goldStatues('gold-statues'),
  goblinFight('goblin-fight'),
  clanCapital2('clan-capital-2'),
  clashiversary('clashiversary'),
  th16('th-16'),
  booksOfClash('books-of-clash'),
  chess('chess'),
  clanCapital('clan-capital'),
  darkAges2('dark-ages-2'),
  darkAges('dark-ages'),
  halloween('halloween'),
  lunarNewYear('lunar-new-year'),
  lunarNewYear2('lunar-new-year-2'),
  monument('monument'),
  space('space'),
  summer('summer'),
  valentines('valentines'),
  christmas('christmas'),
  christmas2('christmas-2'),
  christmas3('christmas-3'),
  clashiversary2('clashiversary-2'),
  clashiversary3('clashiversary-3'),
  colorfest('colorfest'),
  egypt('egypt'),
  goblinGold('goblin-gold'),
  halloween2('halloween-2'),
  hammerJam('hammer-jam'),
  north('north'),
  queenArt('queen-art'),
  temple('temple'),
  th15('th-15'),
  wildWest('wild-west');

  const Banner(this.value);
  final String value;

  static Banner random() {
    final banners = Banner.values;
    return banners[DateTime.now().millisecondsSinceEpoch % banners.length];
  }
}
