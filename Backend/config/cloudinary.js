import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

const connectCloudinary = async () => {
  try {

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Verify Connection
    await cloudinary.api.ping();

    console.log("Cloudinary Connected Successfully");
    
  } catch (error) {
    console.log("Cloudinary Connection Failed");
    console.log(error.message);
  }
};

export { cloudinary, connectCloudinary };

export default cloudinary;
