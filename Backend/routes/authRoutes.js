import express from "express";
import { register, login } from "../controller/authController.js";
import upload from "../middleware/uploadMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", upload.single("profilePicture")  , register);
authRouter.post("/login", login);

export default authRouter;