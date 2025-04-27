const mongoose = require('mongoose')

const schema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,

        },
        lastname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,

        },
        phone: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        }
    }
);

const messages = mongoose.model('messages', schema);
module.exports = messages
