import express from "express";
import {
  simulateDiseaseDetection,
  bookAppointment,
  getUserAppointments,
  getNearbyDoctors,
  getAIRemedy,
  aiChat,
  getDoctorAvailableSlots,
} from "../controller/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import upload from "../middleware/uploadMiddleware.js";

const userRouter = express.Router();

userRouter.post("/ai-remedy", authMiddleware, getAIRemedy);

userRouter.post("/ai-chat", authMiddleware, aiChat);

userRouter.post("/detect", authMiddleware, simulateDiseaseDetection);

userRouter.post("/book-appointment", 
  authMiddleware, 
  upload.array("animalImages",5), 
  bookAppointment
);

userRouter.get("/appointments", authMiddleware, getUserAppointments);

userRouter.get("/doctors", authMiddleware, getNearbyDoctors);

userRouter.get(
  "/doctor-slots/:doctorId/:date",
  authMiddleware,
  getDoctorAvailableSlots,
);

export default userRouter;
