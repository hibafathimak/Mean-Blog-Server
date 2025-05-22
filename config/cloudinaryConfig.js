// config/cloudinaryConfig.js
const { v2: cloudinary } = require('cloudinary');

const connectCloudinary = () => {
    cloudinary.config({
        cloud_name: process.env.CLND_NAME,
        api_key: process.env.CLND_API_KEY,
        api_secret: process.env.CLND_API_SECRET,
    });
    console.log("Connected to Cloudinary");
};

module.exports = { connectCloudinary, cloudinary };
