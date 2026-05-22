CREATE DATABASE  IF NOT EXISTS `task_tracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `task_tracker`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: task_tracker
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(160) NOT NULL,
  `description` text,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_projects_name` (`name`),
  KEY `owner_id` (`owner_id`),
  KEY `ix_projects_id` (`id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=99 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (94,'Website Redesign','Update the company website layout and core framework.','2026-06-01','2026-08-31',5),(95,'Mobile App Launch','Develop and deploy the iOS and Android mobile application.','2026-07-15','2026-12-20',5),(96,'Data Migration','Move legacy database records to the new cloud server.','2026-05-20','2026-06-10',7),(97,'Marketing Campaign','Execute Q3 digital marketing and social media ads.','2026-07-01','2026-09-30',5),(98,'Security Audit','Conduct internal vulnerability scans and compliance checks.','2026-09-01','2026-09-15',5);
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_roles_name` (`name`),
  KEY `ix_roles_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (4,'admin','Can manage users, roles, projects, and tasks.'),(5,'task creator','Can create and maintain projects and tasks.'),(6,'individual read only user','Can view assigned tasks and mark them complete.');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `due_date` date DEFAULT NULL,
  `status` varchar(32) NOT NULL,
  `owner_id` int DEFAULT NULL,
  `project_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `project_id` (`project_id`),
  KEY `ix_tasks_id` (`id`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (1,'Create wireframes and UI mockups for homepage','2026-06-15','not-started',NULL,94),(2,'Set up frontend repository and component library','2026-06-30','not-started',NULL,94),(3,'Develop responsive navigation bar and footer','2026-07-15','not-started',NULL,94),(4,'Integrate backend CMS APIs with frontend views','2026-08-10','not-started',NULL,94),(5,'Perform cross-browser testing and optimization','2026-08-25','not-started',NULL,94),(6,'Configure Apple Developer and Google Play accounts','2026-08-01','not-started',NULL,95),(7,'Implement push notification service architecture','2026-09-15','not-started',NULL,95),(8,'Conduct beta testing via TestFlight and Firebase','2026-10-30','not-started',NULL,95),(9,'Fix critical bugs reported by beta testers','2026-11-30','not-started',NULL,95),(10,'Prepare App Store promotional materials and screenshots','2026-12-10','not-started',NULL,95),(11,'Map legacy database schema to cloud database schema','2026-05-24','not-started',NULL,96),(12,'Write and test data extraction scripts','2026-05-28','not-started',NULL,96),(13,'Run a trial migration on staging environment','2026-06-02','not-started',NULL,96),(14,'Validate data integrity and check for data loss','2026-06-05','not-started',NULL,96),(15,'Execute final production database migration cutover','2026-06-09','not-started',NULL,96),(16,'Design social media ad banners and video copy','2026-07-15','not-started',NULL,97),(17,'Set up Google Analytics tracking for landing page','2026-08-01','not-started',NULL,97),(18,'Launch initial A/B testing for Facebook ad sets','2026-08-20','not-started',NULL,97),(19,'Publish sponsored blog posts and email newsletter','2026-09-10','not-started',NULL,97),(20,'Compile final Q3 campaign conversion report','2026-09-28','not-started',NULL,97),(21,'Run automated vulnerability scans on all servers','2026-09-03','not-started',NULL,98),(22,'Analyze firewall logs and access control lists','2026-09-06','not-started',NULL,98),(23,'Perform penetration testing on external APIs','2026-09-10','not-started',NULL,98),(24,'Draft remediation plan for discovered vulnerabilities','2026-09-13','not-started',NULL,98),(25,'Submit final security compliance documentation','2026-09-15','not-started',NULL,98);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (3,4),(7,4);
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(120) NOT NULL,
  `email` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `google_sub` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `ix_users_google_sub` (`google_sub`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'Kunal Prasad','kunalp2308@gmail.com',1,'103864978747077741898','https://lh3.googleusercontent.com/a/ACg8ocJ_tU6_AxYjxBvFjsPigSoYGzHQEtPePP8xXAqayob03QRK6jFi=s96-c'),(4,'Prince','prince@gmail.com',1,NULL,NULL),(5,'Ankit','ankit@gmail.com',1,NULL,NULL),(6,'Rahul','rahul@gmail.com',1,NULL,NULL),(7,'Prajval','prajval@gmail.com',1,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-22 12:47:33
