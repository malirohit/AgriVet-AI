import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password, role, city, district, village } = req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }


    const user = await userModel.create({
      name,
      email,
      password,
      role,
      city,
      district,
      village,
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

    console.log("Login Email:", email); // Debug log
    console.log("Login Password:", password); // Debug log

    const user = await userModel.findOne({ email });

    console.log("User Email :" , user.email)
    console.log("User Password :", user.password)

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User Not Found" });

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
