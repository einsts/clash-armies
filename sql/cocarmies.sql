CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `googleId` varchar(255) NOT NULL,
  `googleEmail` varchar(255) DEFAULT NULL,
  `username` varchar(45) NOT NULL,
  `playerTag` varchar(20) DEFAULT NULL,
  `createdTime` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_users_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
	

CREATE TABLE `user_roles` (
  `userId` int(11) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`userId`,`role`),
  CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
	

CREATE TABLE `units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `name` varchar(45) NOT NULL,
  `clashId` int(10) unsigned NOT NULL,
  `housingSpace` smallint(5) unsigned NOT NULL,
  `productionBuilding` varchar(75) NOT NULL,
  `isSuper` tinyint(1) NOT NULL DEFAULT 0,
  `isFlying` tinyint(1) NOT NULL DEFAULT 0,
  `isJumper` tinyint(1) NOT NULL DEFAULT 0,
  `airTargets` tinyint(1) NOT NULL DEFAULT 0,
  `groundTargets` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_units_type_name` (`type`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `unit_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unitId` int(11) NOT NULL,
  `level` smallint(5) unsigned NOT NULL,
  `spellFactoryLevel` smallint(6) DEFAULT NULL,
  `barrackLevel` smallint(6) DEFAULT NULL,
  `laboratoryLevel` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_unit_levels_unit_id` (`unitId`),
  CONSTRAINT `fk_unit_levels_unit_id` FOREIGN KEY (`unitId`) REFERENCES `units` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=504 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `pets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `clashId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pets_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
	
CREATE TABLE `pet_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `petId` int(11) NOT NULL,
  `level` smallint(5) unsigned NOT NULL,
  `petHouseLevel` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pet_levels_pet_id` (`petId`),
  CONSTRAINT `fk_pet_levels_pet_id` FOREIGN KEY (`petId`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hero` varchar(30) NOT NULL,
  `name` varchar(45) NOT NULL,
  `clashId` int(10) unsigned NOT NULL,
  `epic` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_equipment_hero_name` (`hero`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `equipment_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipmentId` int(11) NOT NULL,
  `level` smallint(5) unsigned NOT NULL,
  `blacksmithLevel` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_equipment_levels_equipment_id` (`equipmentId`),
  CONSTRAINT `fk_equipment_levels_equipment_id` FOREIGN KEY (`equipmentId`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=658 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `town_halls` (
  `level` smallint unsigned NOT NULL,
  `maxBarracks` smallint DEFAULT NULL,
  `maxDarkBarracks` smallint DEFAULT NULL,
  `maxLaboratory` smallint DEFAULT NULL,
  `maxSpellFactory` smallint DEFAULT NULL,
  `maxDarkSpellFactory` smallint DEFAULT NULL,
  `maxWorkshop` smallint DEFAULT NULL,
  `troopCapacity` smallint DEFAULT NULL,
  `spellCapacity` smallint DEFAULT NULL,
  `siegeCapacity` smallint DEFAULT NULL,
  `maxCc` smallint DEFAULT NULL,
  `maxBlacksmith` smallint DEFAULT NULL,
  `maxPetHouse` smallint DEFAULT NULL,
  `maxBarbarianKing` smallint DEFAULT NULL,
  `maxArcherQueen` smallint DEFAULT NULL,
  `maxGrandWarden` smallint DEFAULT NULL,
  `maxRoyalChampion` smallint DEFAULT NULL,
  `maxMinionPrince` smallint DEFAULT NULL,
  `ccLaboratoryCap` smallint DEFAULT '0',
  `ccTroopCapacity` smallint DEFAULT '0',
  `ccSpellCapacity` smallint DEFAULT '0',
  `ccSiegeCapacity` smallint DEFAULT '0',
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `armies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(75) COLLATE utf8mb4_general_ci NOT NULL,
  `townHall` smallint unsigned NOT NULL,
  `banner` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `createdBy` int NOT NULL,
  `createdTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_armies_created_by` (`createdBy`),
  KEY `fk_armies_town_hall` (`townHall`),
  CONSTRAINT `fk_armies_created_by` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_armies_town_hall` FOREIGN KEY (`townHall`) REFERENCES `town_halls` (`level`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_votes` (
  `armyId` int(11) NOT NULL,
  `votedBy` int(11) NOT NULL,
  `vote` tinyint(4) NOT NULL,
  `createdTime` timestamp NULL DEFAULT current_timestamp(),
  `updatedTime` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`armyId`,`votedBy`),
  KEY `fk_army_votes_voted_by` (`votedBy`),
  CONSTRAINT `fk_army_votes_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_votes_voted_by` FOREIGN KEY (`votedBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `army_votes_vote_value` CHECK (`vote` = -1 or `vote` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `replyTo` int(11) DEFAULT NULL,
  `createdBy` int(11) NOT NULL,
  `createdTime` timestamp NULL DEFAULT current_timestamp(),
  `updatedTime` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_army_comments_reply_to` (`replyTo`),
  KEY `fk_army_comments_created_by` (`createdBy`),
  KEY `fk_army_comments_army_id` (`armyId`),
  CONSTRAINT `fk_army_comments_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_comments_created_by` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_comments_reply_to` FOREIGN KEY (`replyTo`) REFERENCES `army_comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `recipientId` int(11) NOT NULL,
  `triggeringUserId` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `seen` timestamp NULL DEFAULT NULL,
  `armyId` int(11) NOT NULL,
  `commentId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_army_notifications_army_id` (`armyId`),
  KEY `fk_army_notifications_user_id` (`recipientId`),
  KEY `fk_army_notifications_other_user_id` (`triggeringUserId`),
  KEY `fk_army_notifications_comment_id` (`commentId`),
  CONSTRAINT `fk_army_notifications_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_notifications_comment_id` FOREIGN KEY (`commentId`) REFERENCES `army_comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_notifications_other_user_id` FOREIGN KEY (`triggeringUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_notifications_user_id` FOREIGN KEY (`recipientId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_guides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `textContent` text DEFAULT NULL,
  `youtubeUrl` varchar(75) DEFAULT NULL,
  `createdTime` timestamp NULL DEFAULT current_timestamp(),
  `updatedTime` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_guides_armyId` (`armyId`),
  CONSTRAINT `fk_army_guides_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `check_army_guides_one_of_content` CHECK (`textContent` is not null or `youtubeUrl` is not null)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `equipmentId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_equipment_equipment_id` (`armyId`,`equipmentId`),
  KEY `fk_army_equipment_equipment_id` (`equipmentId`),
  CONSTRAINT `fk_army_equipment_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_equipment_equipment_id` FOREIGN KEY (`equipmentId`) REFERENCES `equipment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_tags` (
  `armyId` int(11) NOT NULL,
  `tag` varchar(50) NOT NULL,
  PRIMARY KEY (`armyId`,`tag`),
  CONSTRAINT `fk_army_tags_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_pets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hero` varchar(30) NOT NULL,
  `armyId` int(11) NOT NULL,
  `petId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_pets_pet_id` (`armyId`,`petId`,`hero`),
  KEY `fk_army_pets_equipment_id` (`petId`),
  CONSTRAINT `fk_army_pets_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_pets_equipment_id` FOREIGN KEY (`petId`) REFERENCES `pets` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_units` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `home` varchar(20) NOT NULL DEFAULT 'armyCamp',
  `armyId` int(11) NOT NULL,
  `unitId` int(11) NOT NULL,
  `amount` smallint(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_units_unit_id` (`armyId`,`unitId`,`home`),
  KEY `fk_army_units_unit_id` (`unitId`),
  CONSTRAINT `fk_army_units_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_units_unit_id` FOREIGN KEY (`unitId`) REFERENCES `units` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

 CREATE TABLE `metrics` (
  `name` varchar(100) NOT NULL,
  `weight` int(11) NOT NULL DEFAULT 1,
  `minAgeHours` int(11) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


CREATE TABLE `army_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `value` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_metrics_army_id_type` (`armyId`,`name`),
  KEY `fk_army_metrics_metric_name` (`name`),
  CONSTRAINT `fk_army_metrics_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_metrics_metric_name` FOREIGN KEY (`name`) REFERENCES `metrics` (`name`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `army_metric_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitorUUID` CHAR(36) NOT NULL,
  `armyMetricId` int(11) NOT NULL,
  `lastSeen` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_metric_events_visitor_metric` (`visitorUUID`,`armyMetricId`),
  KEY `fk_army_metric_events_army_metric_id` (`armyMetricId`),
  CONSTRAINT `fk_army_metric_events_army_metric_id` FOREIGN KEY (`armyMetricId`) REFERENCES `army_metrics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sessions_user_id` (`userId`),
  CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `saved_armies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_saved_armies_bookmark` (`armyId`,`userId`),
  KEY `fk_saved_armies_voted_by` (`userId`),
  CONSTRAINT `fk_saved_armies_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_armies_voted_by` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
