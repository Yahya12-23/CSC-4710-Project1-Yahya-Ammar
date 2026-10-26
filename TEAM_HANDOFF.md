# Team handoff — integration with Ammar's requirements 6–10

## Division of work

**Your part (completed code here):**
1. Register users — `POST /api/auth/register`.
2. Sign in — `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`.
3. Search by first/last name — `GET /api/users/name?firstname=...&lastname=...`.
4. Search by userid (= username primary key) — `GET /api/users/id?username=...`.
5. Search by salary between X/Y — `GET /api/users/salary?min=...&max=...`.

**Ammar's part (NOT implemented by this package):**
6. Users within an age range.
7. Users registered after a chosen userid.
8. Users who have never signed in.
9. Users registered on the same day as a chosen userid.
10. Users who registered today.

## How to add Ammar's code with minimal merge conflicts

- Edit **only** `Backend/routes/partnerRoutes.js` to define the five new routes. It is already imported by `Backend/app.js` and mounted at `/api/users`.
- Create `Backend/partnerDbService.js` for the SQL queries for requirements 6–10. It can import the existing `pool` from `./dbService` and run parameterized queries. Do not change `Backend/dbService.js` for partner-owned queries.
- Edit `Frontend/partner.html` and optionally create `Frontend/partner.js` for the partner search UI. It should call the same `http://localhost:5050/api/users/...` backend and include `{ credentials: 'include' }` in `fetch()` if served through Apache.
- Do not change `Frontend/index.html`, `Frontend/index.js`, `Backend/routes/authRoutes.js`, or `Backend/routes/searchRoutes.js` unless you both agree in advance.
- Append **the real SQL statements for 6–10** to the bottom of `sql.txt` before submission. Do not create a different Users table.

## Shared database agreement

Table is named `Users` with columns:
`username` (primary key / userid), `password` (bcrypt hash), `firstname`, `lastname`, `salary`, `age`, `registerday` (DATE), `signintime` (DATETIME nullable).

**Important date detail:** `registerday` stores a calendar date, so requirement 7 can compare later *dates*, not an exact later registration time on the same date. If the professor wants exact registration-time ordering, the team should agree on adding a `registered_at DATETIME` column before implementing it.

## API response agreement

- Search success: HTTP 200 `{ "data": [ { "username": "...", "firstname": "...", ... } ] }`.
- Invalid input: HTTP 400 `{ "error": "..." }`.
- Not signed in: HTTP 401 `{ "error": "Please sign in before searching users." }`.
- Put `requireAuth` from `../middleware/auth` on partner routes.
- Never include `password` in search responses.
- Use `pool.execute('SELECT ... WHERE age BETWEEN ? AND ?', [x, y])`, not user-input string concatenation.

## Suggested Git workflow

Agree on one team repository and two feature branches, for example:
- `feature/requirements-1-5`
- `feature/requirements-6-10`

Commit changes to your respective feature branches, push them, open pull requests, review, and merge into main. Both of you can demonstrate clone, pull/fetch, add, commit, and push for the final video.
