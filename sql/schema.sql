/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.13-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: clash-armies
-- ------------------------------------------------------
-- Server version	11.3.2-MariaDB-1:11.3.2+maria~ubu2204

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__migration__`
--

DROP TABLE IF EXISTS `__migration__`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `__migration__` (
  `step` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `armies`
--

DROP TABLE IF EXISTS `armies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `armies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(75) NOT NULL,
  `townHall` smallint(5) unsigned NOT NULL,
  `banner` varchar(255) NOT NULL,
  `createdBy` int(11) NOT NULL,
  `createdTime` timestamp NULL DEFAULT current_timestamp(),
  `updatedTime` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_armies_created_by` (`createdBy`),
  KEY `fk_armies_town_hall` (`townHall`),
  CONSTRAINT `fk_armies_created_by` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_armies_town_hall` FOREIGN KEY (`townHall`) REFERENCES `town_halls` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_comments`
--

DROP TABLE IF EXISTS `army_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_equipment`
--

DROP TABLE IF EXISTS `army_equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `army_equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `equipmentId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_equipment_equipment_id` (`armyId`,`equipmentId`),
  KEY `fk_army_equipment_equipment_id` (`equipmentId`),
  CONSTRAINT `fk_army_equipment_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_army_equipment_equipment_id` FOREIGN KEY (`equipmentId`) REFERENCES `equipment` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_guides`
--

DROP TABLE IF EXISTS `army_guides`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_metric_events`
--

DROP TABLE IF EXISTS `army_metric_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `army_metric_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `visitorUUID` uuid NOT NULL,
  `armyMetricId` int(11) NOT NULL,
  `lastSeen` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_army_metric_events_visitor_metric` (`visitorUUID`,`armyMetricId`),
  KEY `fk_army_metric_events_army_metric_id` (`armyMetricId`),
  CONSTRAINT `fk_army_metric_events_army_metric_id` FOREIGN KEY (`armyMetricId`) REFERENCES `army_metrics` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_metrics`
--

DROP TABLE IF EXISTS `army_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_notifications`
--

DROP TABLE IF EXISTS `army_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_pets`
--

DROP TABLE IF EXISTS `army_pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_tags`
--

DROP TABLE IF EXISTS `army_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `army_tags` (
  `armyId` int(11) NOT NULL,
  `tag` varchar(50) NOT NULL,
  PRIMARY KEY (`armyId`,`tag`),
  CONSTRAINT `fk_army_tags_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_units`
--

DROP TABLE IF EXISTS `army_units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `army_votes`
--

DROP TABLE IF EXISTS `army_votes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment`
--

DROP TABLE IF EXISTS `equipment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hero` varchar(30) NOT NULL,
  `name` varchar(45) NOT NULL,
  `clashId` int(10) unsigned NOT NULL,
  `epic` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_equipment_hero_name` (`hero`,`name`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `equipment_levels`
--

DROP TABLE IF EXISTS `equipment_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipment_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipmentId` int(11) NOT NULL,
  `level` smallint(5) unsigned NOT NULL,
  `blacksmithLevel` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_equipment_levels_equipment_id` (`equipmentId`),
  CONSTRAINT `fk_equipment_levels_equipment_id` FOREIGN KEY (`equipmentId`) REFERENCES `equipment` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=658 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metrics`
--

DROP TABLE IF EXISTS `metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `metrics` (
  `name` varchar(100) NOT NULL,
  `weight` int(11) NOT NULL DEFAULT 1,
  `minAgeHours` int(11) NOT NULL,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pet_levels`
--

DROP TABLE IF EXISTS `pet_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pet_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `petId` int(11) NOT NULL,
  `level` smallint(5) unsigned NOT NULL,
  `petHouseLevel` smallint(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pet_levels_pet_id` (`petId`),
  CONSTRAINT `fk_pet_levels_pet_id` FOREIGN KEY (`petId`) REFERENCES `pets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=136 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pets`
--

DROP TABLE IF EXISTS `pets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `clashId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pets_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saved_armies`
--

DROP TABLE IF EXISTS `saved_armies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `saved_armies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `armyId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_saved_armies_bookmark` (`armyId`,`userId`),
  KEY `fk_saved_armies_voted_by` (`userId`),
  CONSTRAINT `fk_saved_armies_army_id` FOREIGN KEY (`armyId`) REFERENCES `armies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_saved_armies_voted_by` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `userId` int(11) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sessions_user_id` (`userId`),
  CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `town_halls`
--

DROP TABLE IF EXISTS `town_halls`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `town_halls` (
  `level` smallint(5) unsigned NOT NULL,
  `maxBarracks` smallint(6) DEFAULT NULL,
  `maxDarkBarracks` smallint(6) DEFAULT NULL,
  `maxLaboratory` smallint(6) DEFAULT NULL,
  `maxSpellFactory` smallint(6) DEFAULT NULL,
  `maxDarkSpellFactory` smallint(6) DEFAULT NULL,
  `maxWorkshop` smallint(6) DEFAULT NULL,
  `troopCapacity` smallint(6) DEFAULT NULL,
  `spellCapacity` smallint(6) DEFAULT NULL,
  `siegeCapacity` smallint(6) DEFAULT NULL,
  `maxCc` smallint(6) DEFAULT NULL,
  `maxBlacksmith` smallint(6) DEFAULT NULL,
  `maxPetHouse` smallint(6) DEFAULT NULL,
  `maxBarbarianKing` smallint(6) DEFAULT NULL,
  `maxArcherQueen` smallint(6) DEFAULT NULL,
  `maxGrandWarden` smallint(6) DEFAULT NULL,
  `maxRoyalChampion` smallint(6) DEFAULT NULL,
  `maxMinionPrince` smallint(6) DEFAULT NULL,
  `ccLaboratoryCap` smallint(6) DEFAULT 0,
  `ccTroopCapacity` smallint(6) DEFAULT 0,
  `ccSpellCapacity` smallint(6) DEFAULT 0,
  `ccSiegeCapacity` smallint(6) DEFAULT 0,
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `unit_levels`
--

DROP TABLE IF EXISTS `unit_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `userId` int(11) NOT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`userId`,`role`),
  CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `googleId` varchar(255) NOT NULL,
  `googleEmail` varchar(255) DEFAULT NULL,
  `username` varchar(45) NOT NULL,
  `playerTag` varchar(20) DEFAULT NULL,
  `createdTime` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_users_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-08 18:11:27
