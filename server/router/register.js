const express = require('express');
const router = express.Router();
const User = require('../models/Users');

router.post('/', async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ errorMsg: 'Username and password are required' });
        }

        const existingUser = await User.findOne({ password });
        if (existingUser) {
            return res.status(400).json({ errorMsg: 'Password already exists' });
        }

        const newUser = await User.create({ username, password, role });
        res.status(201).json({ msg: 'User registered successfully'});
        console.log('User registered successfully:', newUser);
    }
    catch(error) {
        console.error('Error in registration route:', error);
        res.status(500).json({ errorMsg: 'Internal server error' });
    }
});

module.exports = router;