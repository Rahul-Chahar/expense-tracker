const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'NO token provided' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {id: decoded.userId};
        next();
    }
    catch(error){
         res.status(401).json({message: 'Invalid token'});
    }
};

module.exports = authenticateToken;