const jwt = require('jsonwebtoken');
const JWT_SECRET = 'vishwajeetIsAGoodBoy';

const fetchuser = (req, res, next) => {
    // Get the token from the header
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).json({ error: 'Please authenticate with a valid token' });
    }

    try {
        // Verify token and extract user details
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        console.error(error.message);
        res.status(401).json({ error: 'Please authenticate with a valid token' });
    }
};

module.exports = fetchuser;
