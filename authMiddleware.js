const jwt = require('jsonwebtoken');
const Constants = require('./Constants');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];;
    if (!token) return res.status(401).send('Access Denied. No token provided.');

    try {
        const verified = jwt.verify(token, Constants.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.log(err)
        res.status(400).send('Invalid token.');
    }
};

module.exports = authMiddleware;
