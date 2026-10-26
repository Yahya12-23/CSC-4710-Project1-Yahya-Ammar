// Protect search endpoints so only signed-in users can query user information.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'Please sign in before searching users.' });
  }
  next();
}
module.exports = { requireAuth };
