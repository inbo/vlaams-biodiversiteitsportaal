/* Disable created on update */
ALTER TABLE `passwords` CHANGE `created` `created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
/* update passwords to nullable expiry and remove all invalid expiryies */
ALTER TABLE `passwords`
MODIFY COLUMN expiry TIMESTAMP NULL DEFAULT NULL;

UPDATE `passwords` SET expiry = null WHERE expiry = 0 or expiry = '2038-01-01 00:00:00';

/** switch userid from int(11) to bigint(20) for GORM default id size */
ALTER TABLE authorities MODIFY userid BIGINT(20);
ALTER TABLE identities MODIFY userid BIGINT(20);
ALTER TABLE passwords MODIFY userid BIGINT(20);
ALTER TABLE profiles MODIFY userid BIGINT(20);
ALTER TABLE users MODIFY userid BIGINT(20) AUTO_INCREMENT;
