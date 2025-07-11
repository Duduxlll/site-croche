const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "produtos", // pasta onde as imagens vão ficar no Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

module.exports = { cloudinary, storage };
