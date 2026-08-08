-- ============================================================
-- Smart Campus Event Planner (WebNova) — Database Schema
-- SOEN287, Summer 2026 — Deliverable 2
--
-- HOW TO USE:
--   1. Open phpMyAdmin (http://localhost/phpmyadmin)
--   2. Create a database named: webnova_db
--   3. Select webnova_db, click the SQL tab
--   4. Paste this entire file and click Go
-- ============================================================

-- Order matters: tables referenced by FOREIGN KEYs must exist first.
-- Events references Users, and Registrations references both Users and Events.

DROP TABLE IF EXISTS Registrations;
DROP TABLE IF EXISTS Events;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;


-- ------------------------------------------------------------
-- 8.1 Users Table
-- ------------------------------------------------------------
CREATE TABLE Users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,   -- UNIQUE prevents duplicate accounts (spec 7.1)
  password_hash VARCHAR(255) NOT NULL,  -- bcrypt hashes are long; never store plain text
  role ENUM('student', 'admin') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 8.4 Categories Table
-- ------------------------------------------------------------
CREATE TABLE Categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  description VARCHAR(255)
);


-- ------------------------------------------------------------
-- 8.2 Events Table
-- ------------------------------------------------------------
CREATE TABLE Events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(150),
  capacity INT NOT NULL,
  status ENUM('open', 'full', 'cancelled', 'completed', 'disabled') NOT NULL DEFAULT 'open',
  organizer_id INT,
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES Users(user_id)
);


-- ------------------------------------------------------------
-- 8.3 Registrations Table
-- ------------------------------------------------------------
-- Note: the spec lists an "attended" field, but it is fully derivable from
-- "status" (attended -> yes, missed -> no, otherwise not yet). Storing both
-- independently allows contradictory rows (e.g. status='cancelled' with
-- attended='yes'), so attendance is computed at query time instead.
CREATE TABLE Registrations (
  registration_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('registered', 'cancelled', 'attended', 'missed') NOT NULL DEFAULT 'registered',
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (event_id) REFERENCES Events(event_id)
);


-- ============================================================
-- SEED DATA (for development and demo)
-- ============================================================

-- Event categories (spec section 4 — must come from the database in Deliverable 2)
INSERT INTO Categories (category_name, description) VALUES
('Academic Workshops', 'Skill-building sessions and academic training.'),
('Career Events', 'Career fairs, employer sessions, and job readiness events.'),
('Club Activities', 'Student club meetups and recurring activities.'),
('Sports Events', 'Varsity games, intramurals, and athletic activities.'),
('Cultural Events', 'Cultural celebrations and performances.'),
('Volunteering Events', 'Community service and volunteering opportunities.'),
('Social Events', 'Casual social gatherings and mixers.'),
('Guest Lectures', 'Talks and lectures from invited speakers.'),
('Networking Events', 'Professional networking and industry mixers.'),
('Other', 'Events that do not fit the other categories.');


-- Sample events
INSERT INTO Events (title, description, category, event_date, start_time, end_time, location, capacity, status) VALUES
('Fall Career Fair', 'Meet employers hiring for internships and full-time roles.', 'Career Events', '2026-09-12', '10:00:00', '16:00:00', 'EV Building Atrium', 200, 'open'),
('Intro to Machine Learning Workshop', 'Hands-on beginner workshop covering ML basics.', 'Academic Workshops', '2026-08-20', '13:00:00', '15:00:00', 'H-937', 50, 'open'),
('Chess Club Weekly Meetup', 'Casual games and friendly tournaments.', 'Club Activities', '2026-08-15', '17:00:00', '19:00:00', 'Hall Building 7th Floor Lounge', 30, 'open');