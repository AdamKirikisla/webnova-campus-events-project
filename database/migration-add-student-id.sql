-- ============================================================
-- Migration: add student_id to the Users table
--
-- ONLY needed if you already imported schema.sql BEFORE the
-- student_id column was added. If you are importing schema.sql
-- fresh, skip this file — the column is already included there.
--
-- HOW TO USE:
--   1. Open phpMyAdmin (http://localhost/phpmyadmin)
--   2. Select the webnova_db database, click the SQL tab
--   3. Paste this file and click Go
-- ============================================================

ALTER TABLE Users
  ADD COLUMN student_id VARCHAR(20) UNIQUE AFTER password_hash;

-- Give the seeded demo student an ID so the profile page has something to show.
UPDATE Users SET student_id = '40000000' WHERE email = 'student@test.com';
