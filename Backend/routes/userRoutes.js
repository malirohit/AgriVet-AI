import express from "express";
import {
  simulateDiseaseDetection,
  bookAppointment,
  getUserAppointments,
  getNearbyDoctors,
  getAIRemedy,
  aiChat,
} from "../controller/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/ai-remedy", authMiddleware, getAIRemedy);

userRouter.post("/ai-chat", authMiddleware, aiChat);

userRouter.post("/detect", authMiddleware, simulateDiseaseDetection);

userRouter.post("/book-appointment", authMiddleware, bookAppointment);

userRouter.get("/appointments", authMiddleware, getUserAppointments);

userRouter.get("/doctors", authMiddleware, getNearbyDoctors);

export default userRouter;
