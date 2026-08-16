-- ============================================================
-- Smart Campus Event Planner (WebNova) — Database Schema
-- SOEN287, Summer 2026 — Deliverable 2
--
-- HOW TO USE:
--   1. Start MySQL from the XAMPP Control Panel
--   2. Open phpMyAdmin (http://localhost/phpmyadmin)
--   3. Click the SQL tab at the top
--   4. Paste this entire file and click Go
--
-- The database itself is created below, so there is nothing to
-- create by hand first. Re-running this file wipes the tables and
-- reloads the sample data.
-- ============================================================

-- Create the database (the "webnova_db" named in your .env) and use it
-- for every statement that follows.
CREATE DATABASE IF NOT EXISTS webnova_db;
USE webnova_db;

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
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  student_id VARCHAR(20) UNIQUE,
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
-- category_id is now a real FOREIGN KEY into Categories
-- ------------------------------------------------------------
CREATE TABLE Events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category_id INT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(150),
  capacity INT NOT NULL,
  status ENUM('open', 'full', 'cancelled', 'completed', 'disabled') NOT NULL DEFAULT 'open',
  organizer_id INT,
  created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES Categories(category_id),
  FOREIGN KEY (organizer_id) REFERENCES Users(user_id)
);


-- ------------------------------------------------------------
-- 8.3 Registrations Table
-- ------------------------------------------------------------
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
-- SEED DATA
-- ============================================================

-- Passwords are bcrypt hashes; both demo accounts use "Password123".
-- student_id is nullable because the signup form does not ask for one:
-- a student sets it later from their profile page.
INSERT INTO Users (full_name, email, password_hash, student_id, role) VALUES
('Test Admin', 'admin@test.com', '$2b$10$FbsxjRCxuN0792oxElKH9OSPSpmR6QggmwAhgFyPs9ue7V3UJYYKe', NULL, 'admin'),
('Test Student', 'student@test.com', '$2b$10$ahRFIO3ktEHIT1/BArDK4e.PBGeUL.gS.NX3Lk47Fm8cfWEHSvehW', '40000000', 'student');

-- Categories inserted first so Events can reference their IDs below.
-- Insertion order fixes the IDs: 1=Academic Workshops, 2=Career Events,
-- 3=Club Activities, 4=Sports Events, 5=Cultural Events, 6=Volunteering
-- Events, 7=Social Events, 8=Guest Lectures, 9=Networking Events, 10=Other.
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


-- Sample events — category_id now points at the Categories rows above
-- (2 = Career Events, 1 = Academic Workshops, 3 = Club Activities)
INSERT INTO Events (title, description, category_id, event_date, start_time, end_time, location, capacity, status) VALUES
('Fall Career Fair', 'Meet employers hiring for internships and full-time roles.', 2, '2026-09-12', '10:00:00', '16:00:00', 'EV Building Atrium', 200, 'open'),
('Intro to Machine Learning Workshop', 'Hands-on beginner workshop covering ML basics.', 1, '2026-08-20', '13:00:00', '15:00:00', 'H-937', 50, 'open'),
('Chess Club Weekly Meetup', 'Casual games and friendly tournaments.', 3, '2026-08-15', '17:00:00', '19:00:00', 'Hall Building 7th Floor Lounge', 30, 'open');



-- Sample registrations — user_id 2 (Test Student) registering for a few events,
-- with a mix of statuses so the frontend has real variety to render/test.
INSERT INTO Registrations (user_id, event_id, status) VALUES
(2, 1, 'registered'),
(2, 2, 'registered'),
(2, 3, 'cancelled');



-- Demo events for presentation week (Thu Aug 13, Fri Aug 14, Sat Aug 15)
INSERT INTO Events (title, description, category_id, event_date, start_time, end_time, location, capacity, status, organizer_id) VALUES
('Thursday Demo Event', 'Event used for demo purposes.', 1, '2026-08-13', '10:00:00', '11:00:00', 'Demo Room', 30, 'open', 1),
('Friday Demo Event', 'Event used for demo purposes.', 1, '2026-08-14', '10:00:00', '11:00:00', 'Demo Room', 30, 'open', 1),
('Saturday Demo Event', 'Event used for demo purposes.', 1, '2026-08-15', '09:00:00', '10:00:00', 'Demo Room', 30, 'open', 1);

-- Registers the test student (user_id 2) to all three demo events above
-- (event_id 4, 5, 6, since they're the 4th/5th/6th events inserted).
INSERT INTO Registrations (user_id, event_id, status) VALUES
(2, 4, 'registered'),
(2, 5, 'registered'),
(2, 6, 'registered');


-- One event per category, covering all status/timing combinations:
-- open/full/cancelled/completed/disabled x past/future
INSERT INTO Events (title, description, category_id, event_date, start_time, end_time, location, capacity, status) VALUES
('Excel Basics Workshop', 'Learn the fundamentals of Excel, including formulas, pivot tables, and data visualization. Bring your laptop!', 1, '2026-09-01', '13:00:00', '15:00:00', 'H-820', 40, 'open'),
('Spring Career Expo', 'Connect with top tech companies and engineering firms looking for interns and new graduates this year.', 2, '2026-09-18', '10:00:00', '16:00:00', 'EV Building Atrium', 200, 'full'),
('Anime Club Movie Night', 'Join us for a double feature of classic Studio Ghibli films. Popcorn and snacks will be provided!', 3, '2026-09-08', '19:00:00', '21:00:00', 'Hall Building 7th Floor Lounge', 30, 'cancelled'),
('Summer Intramural Finals', 'The championship matches for the summer basketball league. Come cheer on your fellow Stingers!', 4, '2026-08-05', '17:00:00', '19:00:00', 'PERFORM Centre', 100, 'completed'),
('Diwali Celebration', 'Celebrate the festival of lights with traditional music, dance performances, and authentic food.', 5, '2026-10-15', '18:00:00', '21:00:00', 'Loyola Quad', 150, 'disabled'),
('Food Bank Volunteer Shift', 'Help sort and distribute food donations for the student emergency food fund.', 6, '2026-08-01', '10:00:00', '13:00:00', 'Norris Building Plaza', 20, 'open'),
('Rooftop Summer Social', 'End the summer semester with music, drinks, and a great view of downtown Montreal.', 7, '2026-08-08', '18:00:00', '22:00:00', 'Hall Building Rooftop', 60, 'full'),
('Guest Talk: Startups 101', 'Local entrepreneurs share their journey from university project to successful startup.', 8, '2026-08-06', '14:00:00', '15:30:00', 'H-110', 80, 'cancelled'),
('Alumni Networking Breakfast', 'Morning coffee and networking with successful John Molson School of Business alumni.', 9, '2026-09-22', '08:00:00', '10:00:00', 'JMSB Atrium', 90, 'open'),
('Old Art Exhibit', 'End-of-year showcase featuring multimedia projects from Fine Arts students.', 10, '2026-07-20', '11:00:00', '17:00:00', 'VA Building Gallery', 50, 'disabled');