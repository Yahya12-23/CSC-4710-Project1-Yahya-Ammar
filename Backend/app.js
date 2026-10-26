const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();
const { pool } = require('./dbService');

if (!process.env.SESSION_SECRET) {
  console.error('Missing SESSION_SECRET. Copy Backend/dotenv to Backend/.env and set a secret.');
  process.exit(1);
}
if (process.env.SESSION_SECRET.startsWith('replace_this')) {
  console.warn('Warning: change SESSION_SECRET in Backend/.env before sharing or deploying.');
}

const app = express();
const port = Number(process.env.PORT || 5050);

// Supports either Node-hosted frontend (:5050) or XAMPP Apache (localhost).
const allowedOrigins = [
  'http://localhost', 'http://localhost:80', 'http://localhost:5050',
  'http://127.0.0.1', 'http://127.0.0.1:80', 'http://127.0.0.1:5050'
];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name: 'project1.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 60 * 60 * 1000 }
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/searchRoutes'));
app.use('/api/users', require('./routes/partnerRoutes')); // Ammar adds 6–10 separately.
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Convenience: frontend works at http://localhost:5050/ without Apache.
app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// Check DB connection before starting the app, making setup errors obvious.
(async () => {
  try {
    await pool.query('SELECT 1');
    app.listen(port, () => {
      console.log(`Backend + frontend: http://localhost:${port}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    console.error('Cannot connect to MySQL:', error.message);
    console.error('Start XAMPP MySQL, create web_app, and review Backend/.env.');
    process.exitCode = 1;
    await pool.end();
  }
})();
