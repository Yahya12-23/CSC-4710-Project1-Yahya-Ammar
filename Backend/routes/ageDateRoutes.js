// Searches by age and by registration date.
const express = require('express');
const db = require('../dbService');
const { textField, validateAgeRange } = require('../lib/input');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

// users between two ages
router.get('/age', async (req, res) => {
  const result = validateAgeRange(req.query);
  if (result.error) return res.status(400).json({ error: result.error });
  const { min, max } = result.value;
  const users = await db.searchByAgeRange(min, max);
  res.json({ data: users });
});

// users who registered after a given user
router.get('/registered-after', async (req, res) => {
  const username = textField(req.query.username);
  if (!username || username.length > 50) {
    return res.status(400).json({ error: 'Enter a valid username (user ID).' });
  }
  const users = await db.searchRegisteredAfter(username);
  res.json({ data: users });
});

// users who never signed in
router.get('/never-signed-in', async (_req, res) => {
  const users = await db.searchNeverSignedIn();
  res.json({ data: users });
});

// users who registered the same day as a given user
router.get('/registered-same-day', async (req, res) => {
  const username = textField(req.query.username);
  if (!username || username.length > 50) {
    return res.status(400).json({ error: 'Enter a valid username (user ID).' });
  }
  const users = await db.searchRegisteredSameDay(username);
  res.json({ data: users });
});

// users who registered today
router.get('/registered-today', async (_req, res) => {
  const users = await db.searchRegisteredToday();
  res.json({ data: users });
});

module.exports = router;
