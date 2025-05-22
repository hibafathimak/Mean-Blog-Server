const users = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


exports.registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(username, email, password)
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
        console.log(error)
        return res.status(500).json(error);
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
           return  res.status(400).json('Email and Password are required');
        }
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(400).json('Invalid credentials');
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


exports.getUserProfile = async (req, res) => {
    try {
        const user = await users.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json('User not found');
        } 
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json(error);
    }
};

exports.updateUserProfile = async (req, res) => {
    try {
        const { username, email, bio } = req.body;
        const existingUser = await users.findOne({ email });

        if (existingUser && existingUser._id.toString() !== req.userId) {
           return  res.status(400).json('Email is already in use by another user');
        }

        
        if (req.file?.path) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "auto",
            });
            uploadedProfilePic = result.secure_url;
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
        );

        if (!updatedUser) {
             res.status(404).json('User not found' );
        }

        return res.status(200).json('Profile updated successfully',);

    } catch (error) {
        console.error(error);
        res.status(500).json('Internal server error');
    }
};