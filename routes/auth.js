const express = require('express');
const router = express.Router();
const User = require('../model/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// JWT Secret Key
const JWT_SECRET = 'your_jwt_secret_key';

router.post('/createuser', [
    body('name', 'Name should be at least 3 characters').isLength({ min: 3 }),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({ name, email, password: hashedPassword });

        await user.save();

        // Generate JWT Token
        const payload = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(payload, JWT_SECRET);

        res.status(201).json({
            message: 'User created successfully',
            authToken
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.post('/login', [
    body('email', 'Invalid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    try{
        let user =await User.findOne({email});
        if(!user){
            return res.status(400).json({error : "Sorry user with this email doesnot exist."});

        }
        const passwordCompare =await bcrypt.compare(password, user.password);
        if(!passwordCompare){
            return res.status(400).json({error : "password does not match"});
        }
        const payload = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(payload, JWT_SECRET);
        res.send({authToken});

    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'internal Server error occurred' });

    }

})

module.exports = router;
