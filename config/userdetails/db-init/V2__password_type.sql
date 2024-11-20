

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
ALTER TABLE `passwords`
  ALTER COLUMN expiry SET DEFAULT '2038-01-01 00:00:00',
  ADD COLUMN type VARCHAR(255)
    AFTER password
;
/*!40101 SET character_set_client = @saved_cs_client */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
UPDATE `passwords` SET `type` = 'legacy';
/*!40101 SET character_set_client = utf8 */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
ALTER TABLE `passwords`
  ALTER COLUMN type SET DEFAULT 'bycrypt';
/*!40101 SET character_set_client = utf8 */;

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
ALTER TABLE `passwords`
  MODIFY COLUMN type VARCHAR(255) NOT NULL;
/*!40101 SET character_set_client = utf8 */;
