import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/User.js";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      contactNumber,
      password,
      role,
      city,
      district,
      village,
      doctorAvailability,
    } = req.body;

    let profileImageUrl = "";

    if (req.file) {
      console.log("Received file:", req.file.originalname); // Debug log

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "agripet-profiles",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      profileImageUrl = result.secure_url;

      console.log("Cloudinary Upload Result:", result); // Debug log
    } else {
      console.log("Profile Picture Not Received"); // Debug log
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const parsedAvailability =
      typeof doctorAvailability === "string"
        ? JSON.parse(doctorAvailability)
        : doctorAvailability;

    const user = await userModel.create({
      profilePicture: profileImageUrl,
      name,
      email,
      contactNumber,
      password,
      role,
      city,
      district,
      village,
      doctorAvailability:
        role === "doctor"
          ? parsedAvailability
          : {},
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    console.log("User Email :", user.email);
    console.log("User Password :", user.password);

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });

    console.log("Login Email:", email); // Debug log
    console.log("Login Password:", password); // Debug log

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({
        success: false,
        message: "Wrong password",
      });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      success: true,
      message: "User logged in successfully",
      token,
      user,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
