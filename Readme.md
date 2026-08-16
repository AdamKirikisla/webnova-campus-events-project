# WebNova — Campus Events Platform

WebNova is a full-stack campus events platform where students can browse and register for campus events, and admins can create and manage them. Originally built as a team project for SOEN 287, later cleaned up and deployed as a live demo.

**Live demo:** https://webnova-campus-events.onrender.com
*(hosted on a free tier — the first load may take 30-50 seconds to wake up)*

**Try it out:**
- Student demo login: `student@test.com` / `DemoPass123!`
- Or sign up your own account

## Features

- Student signup/login with hashed passwords (bcrypt) and server-side sessions
- Browse events by category, date, and status
- Register or cancel registration for events
- Admin dashboard: create, edit, and delete events
- Admin view of all registrations across events
- Role-based access control enforced on the backend (not just hidden in the UI)

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** MySQL
- **Auth:** express-session, bcrypt
- **Frontend:** HTML, CSS, vanilla JavaScript
- **Hosting:** Render (app) + Aiven (MySQL)

## Running Locally

1. Clone the repo and install dependencies:
   ```
   git clone https://github.com/AdamKirikisla/webnova-campus-events.git
   cd webnova-campus-events
   npm install
   ```

2. Create a `.env` file in the project root:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=webnova_db

   SESSION_SECRET=your_own_random_string

   PORT=3000
   ```

3. Start MySQL locally (e.g. via XAMPP) and run `database/schema.sql` against it to create the tables and seed demo data.

4. Start the server:
   ```
   npm run dev
   ```

5. Visit `http://localhost:3000`

## Project Structure

```
├── app.js                 # Entry point, route mounting
├── db.js                  # MySQL connection pool
├── controllers/            # Route logic
├── routes/                 # Express routers
├── database/schema.sql     # Table definitions + seed data
├── view/                   # HTML pages
└── public/                 # CSS, client-side JS, images
```

## Notes

This was originally a team deliverable for SOEN 287 (Concordia University), later hardened and deployed independently — including moving secrets out of source code, separating demo/admin credentials, and fixing a couple of schema mismatches — to serve as a live portfolio piece.
