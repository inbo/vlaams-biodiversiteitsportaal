/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
ALTER TABLE `users`
  MODIFY COLUMN expiry TIMESTAMP NULL DEFAULT NULL;
/*!40101 SET character_set_client = utf8 */;

UPDATE `users` SET expiry = null WHERE expiry = 0;