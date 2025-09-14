const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ ok:false, error:'Missing or invalid Authorization header' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, is_admin }
    next();
  } catch (e) {
    return res.status(401).json({ ok:false, error:'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ ok:false, error:'Admin only' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
