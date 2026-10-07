import cloudinary from "../config/cloudinary.js";

// multer keeps the file in memory, so stream the buffer straight to cloudinary
export const uploadImage = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "shopkart/products", resource_type: "image" },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};
