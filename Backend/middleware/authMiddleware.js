import jwt from "jsonwebtoken";
import userModel from "../models/User.js";

const authMiddleware = async (req, res, next) => {

  try {
    
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authorized, login again" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    req.user = user;

    next();

  } catch (error) {

    console.error("Auth error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
    
  }
};

export default authMiddleware;
