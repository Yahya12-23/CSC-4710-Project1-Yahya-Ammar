# Database Project 1

This implementation follows the assignment in [shiyonglu/database_javascript/project1](https://github.com/shiyonglu/database_javascript/tree/main/project1). It uses the same frontend/backend separation, but improves the sample with safer authentication and a working login session. Yahya implements requirements 1–5. Requirements 6–10 are reserved for Ammar.

## Implemented features

| # | Feature | UI | Backend | SQL |
|---|---|---|---|---|
| 1 | Register a user | Registration form | `POST /api/auth/register` | INSERT |
| 2 | Login | Login form | `POST /api/auth/login` | SELECT + UPDATE |
| 3 | Search by first and/or last name | Two search fields | `GET /api/users/name` | SELECT + LIKE |
| 4 | Search by user ID (= username) | User ID field | `GET /api/users/id` | SELECT + WHERE |
| 5 | Search by salary X through Y | Salary range fields | `GET /api/users/salary` | SELECT + BETWEEN |

Backend: Node.js, Express, mysql2, bcryptjs, express-session. Frontend: HTML/CSS/vanilla JavaScript. Database: MySQL or MariaDB from XAMPP.

## Project folder structure

```
Project1_First5/
├── Backend/
│   ├── app.js                    # Start Express, mount both teammates' routes
│   ├── dbService.js              # Prepared SQL statements, reqs 1–5
│   ├── dotenv                    # Copy to .env; never commit actual .env
│   ├── package.json
│   ├── lib/input.js              # Input validation
│   ├── middleware/auth.js        # Require sign-in for searching
│   ├── routes/authRoutes.js      # Register/login/logout
│   ├── routes/searchRoutes.js    # Search reqs 3–5
│   ├── routes/partnerRoutes.js   # Reserved for Ammar (empty)
│   └── tests/input.test.js
├── Frontend/
│   ├── index.html                # Registration, login, search forms
│   ├── index.js                  # fetch(), display results
│   ├── stylesheet.css
│   └── partner.html              # Ammar's separate UI area (placeholder)
├── database/schema.sql          # Database/table creation
├── sql.txt                      # SQL statements for reqs 1–5
└── TEAM_HANDOFF.md              # Merge and API instructions
```

## Mac setup (XAMPP)

### 1. Start MySQL and Apache

Open `/Applications/XAMPP/manager-osx.app` (or the XAMPP manager in Applications), open **Manage Servers**, and start **MySQL Database** and **Apache Web Server**. Visit `http://localhost/` and `http://localhost/phpmyadmin/` to confirm Apache and phpMyAdmin are running.

### 2. Place this folder inside Apache's web root (recommended)

Copy this `Project1_First5` folder to:

```
/Applications/XAMPP/xamppfiles/htdocs/Project1_First5
```

> In some XAMPP configurations, the web root is elsewhere; check Apache's DocumentRoot. You can also run from any other folder if you prefer Node-only frontend hosting at `http://localhost:5050`.

### 3. Create the database/table

Visit `http://localhost/phpmyadmin/` and open the **SQL** tab. Paste and execute the contents of `database/schema.sql`. It creates a `web_app` database with a `Users` table. **No users are preloaded**; register from the interface.

### 4. Configure environment variables

Open Terminal:

```bash
cd /Applications/XAMPP/xamppfiles/htdocs/Project1_First5/Backend
cp dotenv .env
```

Edit `Backend/.env` in VS Code. `DB_USER=root` and an empty `PASSWORD` may work on a default local XAMPP installation; replace them with your actual XAMPP MySQL credentials if needed. Generate a real local session secret using:

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
- **Using XAMPP Apache as the professor describes:** `http://localhost/Project1_First5/Frontend/index.html`

Both methods connect to the backend at port `5050`.

## Step-by-step test plan

1. **Register:** Enter username `john`, password `ExamplePassword123!`, first name `John`, last name `Doe`, age `25`, salary `52000`. Check phpMyAdmin; `Users` has one row and `password` contains a hash, not `ExamplePassword123!`.
2. **Duplicate username:** Try registering `john` again. Expect a clear "username already taken" error.
3. **Wrong password:** Sign in as `john` with an incorrect password. Expect an error and no sign-in.
4. **Correct password:** Sign in using the correct password. The search section should appear. phpMyAdmin should show a non-NULL `signintime`.
5. **Name search:** Enter `Joh`, `Doe`, or both. Expect `john` in results.
6. **User ID search:** Enter `john`. Expect exactly the `john` row.
7. **Salary search:** Enter `50000` and `60000`. Expect `john`. Search `60000` to `70000` and expect 0 rows.
8. **Refresh:** Reload the page; you should still appear signed in while the session is active.
9. **Logout:** Click Sign out. Search area should become unavailable until logging in again.
10. **SQL injection safety check:** Try username `john' OR '1'='1` in the login box. It should **not** authenticate. The SQL query uses bound parameters.

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
- Registration date is stored as `DATE`, not a precise timestamp. Discuss exact-time registration comparisons with Ammar if requirement 7 needs them.
- The SQL in `sql.txt` uses `?` placeholders because they are sent through `mysql2.execute()`. To test SQL in phpMyAdmin directly, manually substitute example quoted values.

## Running tests

From `Backend/`, execute:

```bash
npm test
```

These unit tests validate inputs only and do not need a running MySQL server. Full browser/integration testing requires XAMPP MySQL.

## Submission and Git workflow

Do not push changes to the professor's `shiyonglu` repository. Copy the project into a shared repository that both you and Ammar can edit, with separate feature branches and pull requests. Keep `sql.txt` as the shared file and let Ammar append his statements for requirements 6–10 before submission. Record a demonstration of results and Git operations as required by the professor.
