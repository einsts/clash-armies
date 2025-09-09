// 军队相关数据模型
// 对应前端的 src/lib/models/Army.svelte.ts 中的类型定义

import 'types.dart';

/// 军队单位数据
class ArmyUnit {
  final int? id;
  final int unitId;
  final UnitHome home;
  final int amount;

  const ArmyUnit({
    this.id,
    required this.unitId,
    required this.home,
    required this.amount,
  });

  factory ArmyUnit.fromJson(Map<String, dynamic> json) {
    return ArmyUnit(
      id: json['id'] as int?,
      unitId: json['unitId'] as int,
      home: UnitHome.values.firstWhere((e) => e.value == json['home']),
      amount: json['amount'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'unitId': unitId,
      'home': home.value,
      'amount': amount,
    };
  }
}

/// 军队装备数据
class ArmyEquipment {
  final int? id;
  final int equipmentId;

  const ArmyEquipment({
    this.id,
    required this.equipmentId,
  });

  factory ArmyEquipment.fromJson(Map<String, dynamic> json) {
    return ArmyEquipment(
      id: json['id'] as int?,
      equipmentId: json['equipmentId'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'equipmentId': equipmentId,
    };
  }
}

/// 军队宠物数据
class ArmyPet {
  final int? id;
  final int petId;
  final HeroType hero;

  const ArmyPet({
    this.id,
    required this.petId,
    required this.hero,
  });

  factory ArmyPet.fromJson(Map<String, dynamic> json) {
    return ArmyPet(
      id: json['id'] as int?,
      petId: json['petId'] as int,
      hero: HeroType.values.firstWhere((e) => e.value == json['hero']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'petId': petId,
      'hero': hero.value,
    };
  }
}

/// 军队攻略数据
class ArmyGuide {
  final int? id;
  final String? textContent;
  final String? youtubeUrl;
  final DateTime? createdTime;
  final DateTime? updatedTime;

  const ArmyGuide({
    this.id,
    this.textContent,
    this.youtubeUrl,
    this.createdTime,
    this.updatedTime,
  });

  factory ArmyGuide.fromJson(Map<String, dynamic> json) {
    return ArmyGuide(
      id: json['id'] as int?,
      textContent: json['textContent'] as String?,
      youtubeUrl: json['youtubeUrl'] as String?,
      createdTime: json['createdTime'] != null 
          ? DateTime.parse(json['createdTime'] as String) 
          : null,
      updatedTime: json['updatedTime'] != null 
          ? DateTime.parse(json['updatedTime'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'textContent': textContent,
      'youtubeUrl': youtubeUrl,
      'createdTime': createdTime?.toIso8601String(),
      'updatedTime': updatedTime?.toIso8601String(),
    };
  }
}

/// 军队评论数据
class ArmyComment {
  final int? id;
  final String comment;
  final int? replyTo;
  final String? username;
  final int? createdBy;
  final DateTime? createdTime;
  final DateTime? updatedTime;

  const ArmyComment({
    this.id,
    required this.comment,
    this.replyTo,
    this.username,
    this.createdBy,
    this.createdTime,
    this.updatedTime,
  });

  factory ArmyComment.fromJson(Map<String, dynamic> json) {
    return ArmyComment(
      id: json['id'] as int?,
      comment: json['comment'] as String,
      replyTo: json['replyTo'] as int?,
      username: json['username'] as String?,
      createdBy: json['createdBy'] as int?,
      createdTime: json['createdTime'] != null 
          ? DateTime.parse(json['createdTime'] as String) 
          : null,
      updatedTime: json['updatedTime'] != null 
          ? DateTime.parse(json['updatedTime'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'comment': comment,
      'replyTo': replyTo,
      'username': username,
      'createdBy': createdBy,
      'createdTime': createdTime?.toIso8601String(),
      'updatedTime': updatedTime?.toIso8601String(),
    };
  }
}

/// 结构化军队评论数据
class StructuredArmyComment extends ArmyComment {
  final List<StructuredArmyComment> replies;

  const StructuredArmyComment({
    super.id,
    required super.comment,
    super.replyTo,
    super.username,
    super.createdBy,
    super.createdTime,
    super.updatedTime,
    this.replies = const [],
  });

  factory StructuredArmyComment.fromJson(Map<String, dynamic> json) {
    return StructuredArmyComment(
      id: json['id'] as int?,
      comment: json['comment'] as String,
      replyTo: json['replyTo'] as int?,
      username: json['username'] as String?,
      createdBy: json['createdBy'] as int?,
      createdTime: json['createdTime'] != null 
          ? DateTime.parse(json['createdTime'] as String) 
          : null,
      updatedTime: json['updatedTime'] != null 
          ? DateTime.parse(json['updatedTime'] as String) 
          : null,
      replies: (json['replies'] as List<dynamic>?)
          ?.map((e) => StructuredArmyComment.fromJson(e as Map<String, dynamic>))
          .toList() ?? [],
    );
  }

  @override
  Map<String, dynamic> toJson() {
    final json = super.toJson();
    json['replies'] = replies.map((e) => e.toJson()).toList();
    return json;
  }
}

/// 军队数据
class Army {
  final int id;
  final int score;
  final int pageViews;
  final int openLinkClicks;
  final int copyLinkClicks;
  final String name;
  final int townHall;
  final ArmyGuide? guide;
  final List<ArmyUnit> units;
  final List<ArmyPet> pets;
  final List<ArmyEquipment> equipment;
  final Banner banner;
  final List<String> tags;
  final List<ArmyComment> comments;
  final String username;
  final int createdBy;
  final DateTime createdTime;
  final DateTime updatedTime;
  final int votes;
  final int userVote;
  final bool userBookmarked;

  const Army({
    required this.id,
    required this.score,
    required this.pageViews,
    required this.openLinkClicks,
    required this.copyLinkClicks,
    required this.name,
    required this.townHall,
    this.guide,
    required this.units,
    required this.pets,
    required this.equipment,
    required this.banner,
    required this.tags,
    required this.comments,
    required this.username,
    required this.createdBy,
    required this.createdTime,
    required this.updatedTime,
    required this.votes,
    required this.userVote,
    required this.userBookmarked,
  });

  factory Army.fromJson(Map<String, dynamic> json) {
    return Army(
      id: json['id'] as int,
      score: json['score'] as int,
      pageViews: json['pageViews'] as int,
      openLinkClicks: json['openLinkClicks'] as int,
      copyLinkClicks: json['copyLinkClicks'] as int,
      name: json['name'] as String,
      townHall: json['townHall'] as int,
      guide: json['guide'] != null 
          ? ArmyGuide.fromJson(json['guide'] as Map<String, dynamic>) 
          : null,
      units: (json['units'] as List<dynamic>)
          .map((e) => ArmyUnit.fromJson(e as Map<String, dynamic>))
          .toList(),
      pets: (json['pets'] as List<dynamic>)
          .map((e) => ArmyPet.fromJson(e as Map<String, dynamic>))
          .toList(),
      equipment: (json['equipment'] as List<dynamic>)
          .map((e) => ArmyEquipment.fromJson(e as Map<String, dynamic>))
          .toList(),
      banner: Banner.values.firstWhere((e) => e.value == json['banner']),
      tags: (json['tags'] as List<dynamic>).cast<String>(),
      comments: (json['comments'] as List<dynamic>)
          .map((e) => ArmyComment.fromJson(e as Map<String, dynamic>))
          .toList(),
      username: json['username'] as String,
      createdBy: json['createdBy'] as int,
      createdTime: DateTime.parse(json['createdTime'] as String),
      updatedTime: DateTime.parse(json['updatedTime'] as String),
      votes: json['votes'] as int,
      userVote: json['userVote'] as int,
      userBookmarked: json['userBookmarked'] as bool,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'score': score,
      'pageViews': pageViews,
      'openLinkClicks': openLinkClicks,
      'copyLinkClicks': copyLinkClicks,
      'name': name,
      'townHall': townHall,
      'guide': guide?.toJson(),
      'units': units.map((e) => e.toJson()).toList(),
      'pets': pets.map((e) => e.toJson()).toList(),
      'equipment': equipment.map((e) => e.toJson()).toList(),
      'banner': banner.value,
      'tags': tags,
      'comments': comments.map((e) => e.toJson()).toList(),
      'username': username,
      'createdBy': createdBy,
      'createdTime': createdTime.toIso8601String(),
      'updatedTime': updatedTime.toIso8601String(),
      'votes': votes,
      'userVote': userVote,
      'userBookmarked': userBookmarked,
    };
  }
}
