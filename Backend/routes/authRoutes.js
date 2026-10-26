// Requirements 1 and 2: registration and sign-in.
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../dbService');
const { textField, validateRegistration } = require('../lib/input');
const router = express.Router();

router.post('/register', async (req, res) => {
  const result = validateRegistration(req.body);
  if (result.error) return res.status(400).json({ error: result.error });

  const { password, ...info } = result.value;
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await db.registerUser({ ...info, passwordHash });
    return res.status(201).json({ message: 'Account created. You can sign in now.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'That username is already taken.' });
    }
    throw error;
  }
});

router.post('/login', async (req, res, next) => {
  const username = textField(req.body.username);
  const password = req.body.password;
  if (!username || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await db.findLoginUser(username);
  // Do not compare plaintext passwords to stored database values.
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!valid) return res.status(401).json({ error: 'Invalid username or password.' });

  await db.recordSuccessfulSignIn(user.username);
  // Regenerate session on sign-in to prevent session fixation.
  req.session.regenerate(err => {
    if (err) return next(err);
    req.session.user = { username: user.username };
    req.session.save(err => {
      if (err) return next(err);
      res.json({ message: 'Signed in successfully.', username: user.username });
    });
  });
});

router.get('/me', (req, res) => {
  if (!req.session?.user) return res.json({ authenticated: false });
  return res.json({ authenticated: true, username: req.session.user.username });
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);
    res.clearCookie('project1.sid');
    res.json({ message: 'Signed out.' });
  });
});

module.exports = router;
