function authorizeRoles(...allowedRoles) {
  const allowed = new Set(allowedRoles.map((role) => String(role || '').trim().toLowerCase()));

  return (req, res, next) => {
    const role = String(req.user?.role || '').trim().toLowerCase();
    if (!role) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowed.has(role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return next();
  };
}

module.exports = authorizeRoles;
