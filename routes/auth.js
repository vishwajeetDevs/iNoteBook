const express = require('express');
const router = express.Router();
const User = require('../model/User'); // Importing the User model
const { body, validationResult } = require('express-validator'); // Importing express-validator for input validation
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for generating JWT tokens
const fetchuser = require('../middleware/fetchuser'); // Middleware to fetch logged-in user details

// JWT Secret Key
const JWT_SECRET = 'vishwajeetIsAGoodBoy';

// Route 1: Create a new user (Signup)
router.post('/createuser', [
    // Validating user input
    body('name', 'Name should be at least 3 characters').isLength({ min: 3 }),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    // Checking for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password } = req.body;

        // Check if a user with the given email already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user instance and save it to the database
        user = new User({ name, email, password: hashedPassword });
        await user.save();

        // Generate JWT token for authentication
        const payload = { user: { id: user.id } };
        const authToken = jwt.sign(payload, JWT_SECRET);

        // Send success response with authentication token
        res.status(201).json({ message: 'User created successfully', authToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Route 2: Login user (Authenticate user)
router.post('/login', [
    // Validating login input
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    // Checking for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        // Find the user by email
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User with this email does not exist' });
        }

        // Compare the given password with the stored hashed password
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token for authentication
        const payload = { user: { id: user.id } };
        const authToken = jwt.sign(payload, JWT_SECRET);

        // Send response with authentication token
        res.json({ authToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route 3: Get logged-in user details
router.get('/getUser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user details excluding the password field
        const user = await User.findById(userId).select('-password');

        // Send user details in response
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
