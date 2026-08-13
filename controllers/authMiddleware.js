// Is the user logged in?
const requireLogin = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next(); // go to the next middleware or route handler
  }

  res.status(401).json({ error: 'Access denied. You must be logged in.' });
};

// Is the user an admin?
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.role === 'admin') {
    return next(); // go to the next middleware or route handler
  }

  res.status(403).json({ error: 'Access denied. Reserved for administrators.' });
};

module.exports = { requireLogin, requireAdmin };
