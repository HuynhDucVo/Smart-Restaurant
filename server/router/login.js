const express = require('express');
const router = express.Router();
const User = require('../models/Users');

router.post('/', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ errorMsg: 'Password is required' });
        }
        
        const existingUser = await User.findOne({ password });
        if (!existingUser) {
            return res.status(400).json({ errorMsg: 'Invalid password' });
        }
        
        console.log('User logged in successfully:', existingUser);
        return res.json({ msg: 'Login successful', user: existingUser });
        

    }
    catch (error) {
        console.error('Error in login route:', error);
        return res.status(500).json({ errorMsg: 'Internal server error' });
    }
})

module.exports = router;