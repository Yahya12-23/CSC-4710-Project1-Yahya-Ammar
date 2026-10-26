// Owned by Ammar. Requirements 6–10 will go here later.
// This file intentionally contains NO search implementations.
// New routes added here will automatically be mounted at /api/users.
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

module.exports = router;
