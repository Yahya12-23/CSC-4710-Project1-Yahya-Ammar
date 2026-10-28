// Additional search routes can be added here.
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const router = express.Router();
router.use(requireAuth);

module.exports = router;
