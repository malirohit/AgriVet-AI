import appointmentModel from "../models/Appointment.js";
import userModel from "../models/User.js";
import { generateAIRemedy } from "../Service/aiRemedyService.js";
import {generateChatResponse } from "../Service/aiChatService.js";

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


export const aiChat = async(req,res)=>{
  try {

    const {message}=req.body;

    console.log("User Message :",message);

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "User Message Required"
      });
    }

    const reply = await generateChatResponse(message);

    console.log("AI Chat Reply :",reply);

    res.status(200).json({
      success: true,
      message: "AI response generated successfully",
      reply
    });


  } catch (error) {

    console.error(error);
    console.log("AI Chat Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI response generation failed"
    });
    
  }
}

export const getAIRemedy = async (req, res) => {
  try {

    const { animalName ,diseaseName  } = req.body;

    console.log("Received animal name for AI remedy:", animalName); // Debug log
    console.log("Received disease name for AI remedy:", diseaseName); // Debug log

    if (!diseaseName || !animalName ) {
      return res.status(400).json({
        success: false,
        message: "Disease name and animal name required",
      });
    }

    const remedy = await generateAIRemedy(animalName,diseaseName);
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
    if (!req.body.doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor is required",
      });
    }

    const appointment = await appointmentModel.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
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
