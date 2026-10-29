# Database Project 1

A user registration and search application built with Node.js, Express, MySQL, and JavaScript.

## Implemented features

| # | Feature | UI | Backend | SQL |
|---|---|---|---|---|
| 1 | Register a user | Registration form | `POST /api/auth/register` | INSERT |
| 2 | Login | Login form | `POST /api/auth/login` | SELECT + UPDATE |
| 3 | Search by first and/or last name | Two search fields | `GET /api/users/name` | SELECT + LIKE |
| 4 | Search by user ID (= username) | User ID field | `GET /api/users/id` | SELECT + WHERE |
| 5 | Search by salary X through Y | Salary range fields | `GET /api/users/salary` | SELECT + BETWEEN |
| 6 | Search by age range | Minimum and maximum age | `GET /api/users/age` | SELECT + BETWEEN |
| 7 | Search users registered after a specified user | Username field | `GET /api/users/registered-after` | SELECT + subquery |
| 8 | Find users who never signed in | Search button | `GET /api/users/never-signed-in` | SELECT + IS NULL |
| 9 | Search by the same registration day as a specified user | Username field | `GET /api/users/registered-same-day` | SELECT + subquery |
| 10 | Find users registered today | Search button | `GET /api/users/registered-today` | SELECT + CURDATE |

Backend: Node.js, Express, mysql2, bcryptjs, express-session. Frontend: HTML/CSS/vanilla JavaScript. Database: MySQL or MariaDB from XAMPP.

## Project folder structure

```
CSC-4710-Project1-Yahya-the team/
├── Backend/
│   ├── app.js                    # Express server and routes
│   ├── dbService.js              # Database queries
│   ├── dotenv                    # Copy to .env; never commit actual .env
│   ├── package.json
│   ├── lib/input.js              # Input validation
│   ├── middleware/auth.js        # Require sign-in for searching
│   ├── routes/authRoutes.js      # Register/login/logout
│   ├── routes/searchRoutes.js    # Search reqs 3–5
│   ├── routes/partnerRoutes.js   # Search reqs 6–10
│   └── tests/input.test.js
├── Frontend/
│   ├── index.html                # Registration, login, search forms
│   ├── index.js                  # fetch(), display results
│   ├── stylesheet.css
│   └── partner.html              # Redirects to the unified application
├── database/schema.sql          # Database/table creation
└── sql.txt                      # SQL statements for reqs 1–10
```

## Mac setup (XAMPP)

### 1. Start MySQL and Apache

Open `/Applications/XAMPP/manager-osx.app` (or the XAMPP manager in Applications), open **Manage Servers**, and start **MySQL Database** and **Apache Web Server**. Visit `http://localhost/` and `http://localhost/phpmyadmin/` to confirm Apache and phpMyAdmin are running.

### 2. Optional Apache setup

Copy this `Project1` folder to:

```
/Applications/XAMPP/xamppfiles/htdocs/Project1
```

> In some XAMPP configurations, the web root is elsewhere; check Apache's DocumentRoot. You can also run from any other folder if you prefer Node-only frontend hosting at `http://localhost:5050`.

### 3. Create the database/table

Visit `http://localhost/phpmyadmin/` and open the **SQL** tab. Paste and execute the contents of `database/schema.sql`. It creates a `web_app` database with a `Users` table. **No users are preloaded**; register from the interface.

### 4. Configure environment variables

Open Terminal:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/CSC-4710-Project1-Yahya-the team/Backend
cp dotenv .env
```

Edit `Backend/.env` in your editor. `DB_USER=root` and an empty `PASSWORD` may work on a default local XAMPP installation; replace them with your actual XAMPP MySQL credentials if needed. Generate a real local session secret using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated string into `SESSION_SECRET=` in `Backend/.env`. Never commit `.env` or share database credentials.

### 5. Install and run the backend

Still in `Backend/`:

```bash
node -v
npm install
npm start
```

You should see:

```
Backend + frontend: http://localhost:5050
Health check: http://localhost:5050/api/health
```

If you see `Cannot connect to MySQL`, verify XAMPP's MySQL server is running, `web_app` has been created, and `.env` matches the correct port/user/password. If you see `EADDRINUSE`, another app may already be using port 5050.

### 6. Open the frontend

Either URL should work:

- **Recommended / simpler:** `http://localhost:5050/` (Node serves the HTML/CSS/JS)
- **Using XAMPP Apache as the professor describes:** `http://localhost/Project1/Frontend/index.html`

Both methods connect to the backend at port `5050`.

## Manual test plan

1. **Register:** Enter username `john`, password `ExamplePassword123!`, first name `John`, last name `Doe`, age `25`, salary `52000`. Check phpMyAdmin; `Users` has one row and `password` contains a hash, not `ExamplePassword123!`.
2. **Duplicate username:** Try registering `john` again. Expect a clear "username already taken" error.
3. **Wrong password:** Sign in as `john` with an incorrect password. Expect an error and no sign-in.
4. **Correct password:** Sign in using the correct password. The search section should appear. phpMyAdmin should show a non-NULL `signintime`.
5. **Name search:** Enter `Joh`, `Doe`, or both. Expect `john` in results.
6. **User ID search:** Enter `john`. Expect exactly the `john` row.
7. **Salary search:** Enter `50000` and `60000`. Expect `john`. Search `60000` to `70000` and expect 0 rows.
8. **Age search:** Enter `20` and `30`. Expect `john`. Reverse the bounds or enter a decimal and expect a validation error.
9. **Registered after:** Enter a username. Expect users whose `registerday` is later than that user's registration day.
10. **Never signed in:** Register a second account but do not sign in as it. Expect it in the results; signed-in users should not appear.
11. **Same registration day:** Search using a username. Expect all users sharing that user's `registerday`, including that user.
12. **Registered today:** Expect all users whose `registerday` equals MySQL's current date (`CURDATE()`).
13. **Refresh:** Reload the page; you should still appear signed in while the session is active.
14. **Logout:** Click Sign out. Search area should become unavailable until logging in again.
15. **SQL injection safety check:** Try username `john' OR '1'='1` in the login box. It should **not** authenticate. The SQL query uses bound parameters.

## How the request flows

For example, salary search:

```
Frontend search form
  -> index.js fetch('/api/users/salary?min=50000&max=60000')
  -> Backend/routes/searchRoutes.js (validate inputs)
  -> Backend/dbService.js (execute prepared SQL)
  -> MySQL Users table
  -> JSON { data: [...] }
  -> index.js renders safe text cells in the HTML table
```

`mysql2.execute(query, values)` binds inputs as **data**, not SQL syntax, so user inputs cannot change the query structure. Stored password hashes are never included in search results.

## Important limitations

- This is a **local classroom demonstration**, not a production authentication system. `express-session` defaults to an in-memory session store; a deployed service should use a persistent store, HTTPS with secure cookies, appropriate rate limits and more authorization controls.
- Search users are viewable by anyone who can sign in; that access model follows the assignment and is not appropriate for private real-world salary data.
- Registration date is stored as `DATE`, not a precise timestamp. Use a timestamp column if exact registration-time comparisons are needed.
- The SQL in `sql.txt` uses `?` placeholders because they are sent through `mysql2.execute()`. To test SQL in phpMyAdmin directly, manually substitute example quoted values.

## Running tests

From `Backend/`, execute:

```bash
npm test
```

These unit tests validate inputs only and do not need a running MySQL server. Full browser/integration testing requires XAMPP MySQL.
