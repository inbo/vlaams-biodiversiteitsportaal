DELETE ur FROM user_role ur WHERE NOT EXISTS (SELECT u.userid FROM users u WHERE u.userid = ur.user_id);
ALTER TABLE user_role ADD CONSTRAINT fk_users_userid FOREIGN KEY (user_id) REFERENCES users(userid) ON DELETE CASCADE;