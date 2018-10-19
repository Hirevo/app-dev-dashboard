-- MySQL dump 10.16  Distrib 10.3.10-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: dashboard
-- ------------------------------------------------------
-- Server version	10.3.10-MariaDB-1:10.3.10+maria~bionic

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `github`
--

DROP TABLE IF EXISTS `github`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `github` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `access_token` varchar(255) NOT NULL,
  `refresh_token` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `github_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `github`
--

LOCK TABLES `github` WRITE;
/*!40000 ALTER TABLE `github` DISABLE KEYS */;
/*!40000 ALTER TABLE `github` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `steam`
--

DROP TABLE IF EXISTS `steam`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `steam` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `steam_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `steam`
--

LOCK TABLES `steam` WRITE;
/*!40000 ALTER TABLE `steam` DISABLE KEYS */;
/*!40000 ALTER TABLE `steam` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trello`
--

DROP TABLE IF EXISTS `trello`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `trello` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `secret_token` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `trello_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trello`
--

LOCK TABLES `trello` WRITE;
/*!40000 ALTER TABLE `trello` DISABLE KEYS */;
/*!40000 ALTER TABLE `trello` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_widget`
--

DROP TABLE IF EXISTS `user_widget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_widget` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `widget_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `widget_id` (`widget_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_widget_ibfk_1` FOREIGN KEY (`widget_id`) REFERENCES `widgets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_widget_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_widget`
--

LOCK TABLES `user_widget` WRITE;
/*!40000 ALTER TABLE `user_widget` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_widget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `passwd` varchar(255) DEFAULT NULL,
  `github_id` varchar(255) DEFAULT NULL,
  `trello_id` varchar(255) DEFAULT NULL,
  `steam_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (26,'CedricThomas',NULL,'25383439',NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `widgets`
--

DROP TABLE IF EXISTS `widgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `widgets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag` varchar(255) NOT NULL,
  `path` varchar(255) NOT NULL,
  `service` varchar(255) NOT NULL,
  `description` varchar(1024) NOT NULL,
  `params` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `requirements` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `widgets`
--

LOCK TABLES `widgets` WRITE;
/*!40000 ALTER TABLE `widgets` DISABLE KEYS */;
INSERT INTO `widgets` VALUES (1,'current-weather','/dist/widgets/current-weather.js','weather','Displays current weather data','[{\"name\":\"city\",\"display_name\":\"City\",\"type\":\"string\"},{\"name\":\"timer\",\"display_name\":\"Refresh timer\",\"type\":\"integer\"}]',NULL),(2,'forecast-weather','/dist/widgets/forecast-weather.js','weather','Displays charts about forecast weather data','[{\"name\":\"city\",\"display_name\":\"City\",\"type\":\"string\"},{\"name\":\"timer\",\"display_name\":\"Refresh timer\",\"type\":\"integer\"}]',NULL),(3,'trello-cards','/dist/widgets/trello-cards.js','trello','trello cards lister','[{\"name\": \"board_name\", \"display_name\":\"Board name\",\"type\":\"string\"},{\"name\": \"timer\", \"display_name\":\"Timer\",\"type\":\"integer\"}]','trello_id'),(4,'steam-game-watchers','/dist/widgets/steam-game-watcher.js','steam','Game activity watcher','[{\"name\": \"game\", \"display_name\":\"Game\",\"type\":\"string\"}, {\"name\": \"timer\", \"display_name\":\"Timer\",\"type\":\"integer\"}]','steam_id'),(5,'steam-games','/dist/widgets/steam-games.js','steam','Games list','[{\"name\": \"timer\", \"display_name\":\"Timer\",\"type\":\"integer\"}]','steam_id'),(6,'steam-friends','/dist/widgets/steam-friends.js','steam','Friends list','[{\"name\": \"timer\", \"display_name\":\"Timer\",\"type\":\"integer\"}]','steam_id');
/*!40000 ALTER TABLE `widgets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-10-19 19:05:04
