const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json('All fields are required');
        }

        const existingUser = await users.findOne({ email });
        if (existingUser) {
            return res.status(400).json('User already exists');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = new users({
                username,
                email,
                password: hashedPassword
            });

            await user.save();
            return res.status(201).json('User registered successfully');
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
             res.status(400).json('Email and Password are required');
        }
        const user = await users.findOne({ email });
        if (!user) {
             res.status(400).json('Invalid credentials');
        } else {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json('Invalid credentials');
            } 
            const token = jwt.sign({ userId: user._id ,role: user.role }, process.env.JWT_SECRET);
            return res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
        }
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await users.findById(req.userId);
        if (!user) {
            return res.status(404).json('User not found');
        } 
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(error);
    }
};

// Update User Profile
exports.updateUserProfile = async (req, res) => {
    try {
        const { username, email, bio } = req.body;
        const uploadedProfilePic = req.file?req.file.filename:profilePic
        const existingUser = await users.findOne({ email });
        if (existingUser && existingUser._id.toString() !== req.userId) {
             res.status(400).json('Email is already in use by another user');
        }
        const updatedUser = await users.findByIdAndUpdate(
            req.userId,
            {
                username,
                email,
                bio,
                profilePic: uploadedProfilePic
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
             res.status(404).json('User not found' );
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json('Internal server error');
    }
};