import express from "express";

import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controller/doctorController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const doctorRouter = express.Router();

doctorRouter.get("/appointments",authMiddleware,getDoctorAppointments);

doctorRouter.put("/update-appointment/:id",authMiddleware,updateAppointmentStatus,);

export default doctorRouter;
