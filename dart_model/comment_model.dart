// CommentModel 类
// 对应前端的 src/lib/models/Comment.svelte.ts

import 'types.dart';
import 'army_data.dart';

/// 评论模型类
class CommentModel {
  final StaticGameData gameData;
  final int? id;
  final String? username;
  final int? createdBy;
  final DateTime? createdTime;
  final DateTime? updatedTime;
  String comment;
  int? replyTo;
  final List<CommentModel> replies = [];

  CommentModel({
    required this.gameData,
    this.id,
    this.username,
    this.createdBy,
    this.createdTime,
    this.updatedTime,
    required this.comment,
    this.replyTo,
  });

  /// 从 ArmyComment 创建 CommentModel
  factory CommentModel.fromArmyComment(StaticGameData gameData, ArmyComment data) {
    return CommentModel(
      gameData: gameData,
      id: data.id,
      username: data.username,
      createdBy: data.createdBy,
      createdTime: data.createdTime,
      updatedTime: data.updatedTime,
      comment: data.comment,
      replyTo: data.replyTo,
    );
  }

  /// 创建新评论
  factory CommentModel.create(StaticGameData gameData, {
    required String comment,
    int? replyTo,
  }) {
    return CommentModel(
      gameData: gameData,
      comment: comment,
      replyTo: replyTo,
    );
  }

  /// 获取保存数据
  ArmyComment getSaveData() {
    return ArmyComment(
      id: id,
      comment: comment,
      replyTo: replyTo,
      username: username,
      createdBy: createdBy,
      createdTime: createdTime,
      updatedTime: updatedTime,
    );
  }

  /// 结构化评论列表
  static List<StructuredArmyComment> structureComments(List<CommentModel> comments) {
    final Map<int, StructuredArmyComment> map = {};
    final List<StructuredArmyComment> structured = [];

    // 创建评论映射
    for (final comment in comments) {
      final id = comment.id;
      final username = comment.username;
      final createdBy = comment.createdBy;
      final createdTime = comment.createdTime;
      final updatedTime = comment.updatedTime;

      if (id == null || username == null || createdBy == null || 
          createdTime == null || updatedTime == null) {
        continue;
      }

      map[id] = StructuredArmyComment(
        id: id,
        comment: comment.comment,
        replyTo: comment.replyTo,
        username: username,
        createdBy: createdBy,
        createdTime: createdTime,
        updatedTime: updatedTime,
        replies: [],
      );
    }

    // 构建层级结构
    for (final comment in comments) {
      final id = comment.id;
      if (id == null) continue;

      if (comment.replyTo == null) {
        // 顶级评论
        final structuredComment = map[id];
        if (structuredComment != null) {
          structured.add(structuredComment);
        }
      } else {
        // 回复，添加到父评论的回复列表中
        final parentComment = map[comment.replyTo!];
        if (parentComment != null) {
          final structuredComment = map[id];
          if (structuredComment != null) {
            parentComment.replies.add(structuredComment);
          }
        }
      }
    }

    return structured;
  }

  /// 检查评论是否有效
  bool get isValid {
    return comment.isNotEmpty && comment.length <= 2000; // MAX_COMMENT_LENGTH
  }

  /// 检查是否为顶级评论
  bool get isTopLevel {
    return replyTo == null;
  }

  /// 检查是否为回复
  bool get isReply {
    return replyTo != null;
  }

  /// 获取评论深度（用于显示缩进）
  int getDepth(List<CommentModel> allComments) {
    if (isTopLevel) return 0;
    
    int depth = 1;
    CommentModel? current = this;
    
    while (current?.replyTo != null) {
      current = allComments.where((c) => c.id == current!.replyTo).firstOrNull;
      if (current != null) depth++;
    }
    
    return depth;
  }

  /// 添加回复
  void addReply(CommentModel reply) {
    replies.add(reply);
  }

  /// 移除回复
  void removeReply(CommentModel reply) {
    replies.remove(reply);
  }

  /// 获取所有回复（包括嵌套回复）
  List<CommentModel> getAllReplies() {
    final List<CommentModel> allReplies = [];
    
    for (final reply in replies) {
      allReplies.add(reply);
      allReplies.addAll(reply.getAllReplies());
    }
    
    return allReplies;
  }

  /// 获取回复数量（包括嵌套回复）
  int get totalReplyCount {
    int count = replies.length;
    for (final reply in replies) {
      count += reply.totalReplyCount;
    }
    return count;
  }
}