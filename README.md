# CSC 4710 Database Project

A small website where people can register, sign in, and search the users in a MySQL database. It uses Node.js, Express and plain HTML/CSS/JavaScript.

## What it does

- Register a new user (passwords are saved as bcrypt hashes)
- Sign in (queries use `?` placeholders so SQL injection does not work)
- Search users by first and/or last name
- Search by user ID (username)
- Search by salary range
- Search by age range
- Find users who registered after a given user
- Find users who never signed in
- Find users who registered the same day as a given user
- Find users who registered today

Searches only show up after you sign in. All of the SQL is in `sql.txt`.

## Folders

```
Backend/    Express server, routes, database code and tests
Frontend/   index.html, index.js and stylesheet.css
database/   schema.sql (creates the web_app database and Users table)
sql.txt     every SQL statement we use
```

## How to run it

1. Start **MySQL** in the XAMPP control panel.
2. Open http://localhost/phpmyadmin, go to the **SQL** tab, and run everything in `database/schema.sql`.
3. In the `Backend` folder, copy `dotenv` to `.env`:
   ```
   copy dotenv .env
   ```
   The defaults (user `root`, empty password) work for a normal XAMPP install. Change `SESSION_SECRET` to any long random text.
4. Install and start the server:
   ```
   npm install
   npm start
   ```
5. Open http://localhost:5050 in your browser.

If you see `Cannot connect to MySQL`, check that MySQL is running and that `.env` matches your setup. If port 5050 is busy, change `PORT` in `.env`.

## Running the tests

```
cd Backend
npm test
```

These only check input validation, so MySQL does not need to be running.

## Notes

- Sessions are kept in memory, so you get signed out when the server restarts.
- Registration day is a `DATE`, so "registered after" compares days, not exact times.
