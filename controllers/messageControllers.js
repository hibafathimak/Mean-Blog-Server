const messages = require('../models/messageModel'); // adjust path based on your project structure

// Create a new message
const createMessage = async (req, res) => {
    try {
        const { firstname, lastname, email, phone, description } = req.body;

        const newMessage = new messages({ firstname, lastname, email, phone, description });
        await newMessage.save();

        res.status(201).json('Message created successfully');
    } catch (error) {
        res.status(500).json('Error creating message');
    }
};

// Get all messages
const getMessages = async (req, res) => {
    try {
        const messages = await messages.find();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json('Error fetching messages');
    }
};

// Delete a message by ID
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMessage = await messages.findByIdAndDelete(id);

        if (!deletedMessage) {
            return res.status(404).json('Message not found');
        }

        res.status(200).json('Message deleted successfully');
    } catch (error) {
        res.status(500).json('Error deleting message');
    }
};

module.exports = { createMessage, getMessages, deleteMessage };
