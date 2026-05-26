import appointmentModel from "../models/Appointment.js";
import userModel from "../models/User.js";

import { generateAIRemedy } from "../Service/aiRemedyService.js";
import { generateChatResponse } from "../Service/aiChatService.js";

import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

export const simulateDiseaseDetection = async (req, res) => {
  try {
    res.json({
      disease: "Fungal Skin Infection",
      severity: "Moderate",
      confidence: "92%",
      remedy:
        "Clean the affected area, apply antifungal ointment, and consult a veterinarian if symptoms persist.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const aiChat = async (req, res) => {
  try {
    const { message } = req.body;

    console.log("User Message :", message);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "User Message Required",
      });
    }

    const reply = await generateChatResponse(message);

    console.log("AI Chat Reply :", reply);

    res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      reply,
    });
  } catch (error) {
    console.error(error);
    console.log("AI Chat Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI response generation failed",
    });
  }
};

export const getAIRemedy = async (req, res) => {
  try {
    const { animalName, diseaseName } = req.body;

    console.log("Received animal name for AI remedy:", animalName); // Debug log
    console.log("Received disease name for AI remedy:", diseaseName); // Debug log

    if (!diseaseName || !animalName) {
      return res.status(400).json({
        success: false,
        message: "Disease name and animal name required",
      });
    }

    const remedy = await generateAIRemedy(animalName, diseaseName);
    console.log("Generated AI remedy:", remedy); // Debug log

    res.status(200).json({
      message: "AI remedy generated successfully",
      success: true,
      remedy,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "AI remedy generation failed",
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const {
      doctor,

      appointmentDate,

      appointmentSlot,
    } = req.body;

    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "agripet-appointments",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          );

          streamifier.createReadStream(file.buffer).pipe(stream);
        });

        uploadedImages.push(result.secure_url);
      }
    }
    // DATE VALIDATION

    const selectedDate = new Date(appointmentDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    if (selectedDate < today || selectedDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: "Appointments can only be booked within next 30 days",
      });
    }

    // DOCTOR VALIDATION

    const doctorData = await userModel.findById(doctor);

    if (!doctorData) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // CHECK DAY AVAILABILITY

    const dayName = selectedDate
      .toLocaleDateString("en-US", {
        weekday: "long",
      })
      .toLowerCase();

    const availability = doctorData.doctorAvailability?.[dayName];

    if (!availability || !availability.enabled) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available on selected day",
      });
    }

    // CHECK SLOT EXISTS , Valid Slots Generation

    const startHour = parseInt(availability.start.split(":")[0]);

    const endHour = parseInt(availability.end.split(":")[0]);

    let validSlots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const slot = `${hour}:00 - ${hour + 1}:00`;

      validSlots.push(slot);
    }

    if (!validSlots.includes(appointmentSlot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment slot",
      });
    }

    // CHECK SLOT ALREADY BOOKED
    const existingAppointment = await appointmentModel.findOne({
      doctor,
      appointmentDate,
      appointmentSlot,
      status: { $ne: "Rejected" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Slot already booked , plz look for another slot ",
      });
    }

    // CREATE APPOINTMENT

    const appointment = await appointmentModel.create({
      ...req.body,
      animalImages: uploadedImages,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,

      message:
        "Appointment booked successfully and waiting for doctor approval",

      appointment,
    });
  } catch (error) {
    console.error("Appointment Booking Error:", error.message);

    res.status(500).json({ message: error.message });
  }
};

export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ user: req.user.id })
      .populate("doctor", "name specialization");

    res.status(200).json({
      success: true,
      message: "User appointments fetched successfully",
      appointments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyDoctors = async (req, res) => {
  try {
    // Can optimize to take user district from request only
    // Instead of doing backend call
    const user = await userModel.findById(req.user.id);

    const doctors = await userModel.find({
      role: "doctor",
      district: user.district,
    });

    res.status(200).json({
      success: true,
      message: "All nearby doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDoctorAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;

    // DATE VALIDATION

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 30);

    if (selectedDate < today || selectedDate > maxDate) {
      return res.status(400).json({
        success: false,
        message: "Slots available only for next 30 days",
      });
    }

    // FIND DOCTOR

    const doctor = await userModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // GET DAY NAME
    const dayName = selectedDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const availability = doctor.doctorAvailability?.[dayName];

    if (!availability || !availability.enabled) {
      return res.status(200).json({
        success: true,
        slots: [],
      });
    }

    // GENERATE SLOTS

    const startHour = parseInt(availability.start.split(":")[0]);

    const endHour = parseInt(availability.end.split(":")[0]);

    let slots = [];

    for (let hour = startHour; hour < endHour; hour++) {
      const slot = `${hour}:00 - ${hour + 1}:00`;

      slots.push(slot);
    }

    // FIND BOOKED SLOTS
    const bookedAppointments = await appointmentModel.find({
      doctor: doctorId,
      appointmentDate: date,
      status: { $ne: "Rejected" },
    });

    const bookedSlots = bookedAppointments.map((a) => a.appointmentSlot);

    // REMOVE BOOKED SLOTS
    const availableSlots = slots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      slots: availableSlots,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
