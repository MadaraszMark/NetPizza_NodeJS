exports.requireAuth = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    next();
};

exports.requireRole = (...roles) => (req, res, next) => {
    const u = req.session.user;
    if (!u) return res.redirect('/login');
    if (!roles.includes(u.role)) return res.status(403).send('Nincs jogosultság.');
    next();
};
