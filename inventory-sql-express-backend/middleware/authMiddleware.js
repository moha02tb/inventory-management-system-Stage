const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Please configure it in your .env file.');
}

// Middleware to check if the user is logged in
exports.protect = (req, res, next) => {
    // Get token from header (usually sent as 'Bearer [token]')
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('Auth check - Token:', token ? 'Present' : 'Missing');

    if (!token) {
        console.log('No token found in Authorization header');
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        // Attach user info (ID and Role) to the request object
        req.user = decoded.user;
        console.log('Token verified for user:', req.user);
        next(); // Proceed to the next middleware or controller
    } catch (e) {
        console.log('Token verification failed:', e.message);
        res.status(401).json({ msg: 'Token is not valid', error: e.message });
    }
};

// Middleware to check if the user has a specific role
exports.roleRestrict = (role) => (req, res, next) => {
    // Check if req.user (attached by the 'protect' middleware) exists and has the required role
    if (req.user && req.user.role === role) {
        next(); // User has the required role, proceed
    } else {
        res.status(403).json({ msg: `Access denied. Requires ${role} role.` });
    }
};
