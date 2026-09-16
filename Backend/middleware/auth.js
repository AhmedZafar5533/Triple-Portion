/**
 * Verify session from MongoStore via connect.sid cookie.
 * Attaches user identity to req.user for downstream compatibility.
 */
const verifySession = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Access denied. No active session.' });
  }

  // Attach basic user data to req.user for backward compatibility with other middlewares
  req.user = {
    id: req.session.userId,
    role: req.session.role,
    email: req.session.email
  };
  
  next();
};

/**
 * Role-based authorization middleware factory.
 * @param  {...string} roles - Allowed roles (e.g. 'buyer', 'seller', 'admin')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      console.log(`Authorization failed: User role is "${req.user?.role}", required roles: ${roles.join(', ')}`);
      return res.status(403).json({ error: 'Access forbidden. Insufficient permissions.' });
    }
    next();
  };
};

/**
 * Specialized middleware for Admin access
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  next();
};

/**
 * Specialized middleware for Seller access
 */
const isSeller = (req, res, next) => {
  if (!req.user || req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Forbidden: Seller access required.' });
  }
  next();
};

/**
 * Specialized middleware for Buyer access
 */
const isBuyer = (req, res, next) => {
  if (!req.user || req.user.role !== 'buyer') {
    return res.status(403).json({ error: 'Forbidden: Buyer access required.' });
  }
  next();
};

module.exports = { 
  verifySession, 
  authorizeRoles,
  isAdmin,
  isSeller,
  isBuyer
};
