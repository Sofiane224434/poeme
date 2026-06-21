const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acces admin requis' });
    }

    next();
};

export default adminMiddleware;
