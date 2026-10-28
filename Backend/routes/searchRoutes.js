const express = require('express');
const db = require('../dbService');
const { textField, validateSalaryRange } = require('../lib/input');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

// Allow partial matches for first and last names.
router.get('/name', async (req, res) => {
  const firstname = textField(req.query.firstname);
  const lastname = textField(req.query.lastname);
  if (!firstname && !lastname) {
    return res.status(400).json({ error: 'Enter a first name, a last name, or both.' });
  }
  if (firstname.length > 50 || lastname.length > 50) {
    return res.status(400).json({ error: 'Names must contain at most 50 characters.' });
  }
  const users = await db.searchByName(firstname, lastname);
  res.json({ data: users });
});

// Username identifies each account.
router.get('/id', async (req, res) => {
  const username = textField(req.query.username);
  if (!username || username.length > 50) {
    return res.status(400).json({ error: 'Enter a valid username (user ID).' });
  }
  const users = await db.searchByUsername(username);
  res.json({ data: users });
});

// Include both endpoints of the salary range.
router.get('/salary', async (req, res) => {
  const result = validateSalaryRange(req.query);
  if (result.error) return res.status(400).json({ error: result.error });
  const { min, max } = result.value;
  const users = await db.searchBySalary(min, max);
  res.json({ data: users });
});

module.exports = router;
