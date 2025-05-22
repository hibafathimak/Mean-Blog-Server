const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLND_NAME,
  api_key: process.env.CLND_API_KEY,
  api_secret: process.env.CLND_API_SECRET,
});


module.exports = cloudinary ;
