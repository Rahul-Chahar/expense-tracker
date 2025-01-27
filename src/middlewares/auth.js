const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        req.user = { id: jwt.verify(token, process.env.JWT_SECRET).userId };
        next();
    } catch {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authenticateToken;