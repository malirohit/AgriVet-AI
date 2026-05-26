import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    animalImages: [
      {
        type: String,
      },
    ],

    nature: String,

    symptoms: String,

    emergency: Boolean,

    appointmentDate: {
      type: String,
    },

    appointmentSlot: {
      type: String,
    },

    location: String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Scheduled", "Completed"],
      default: "Pending",
    },

    visitStatus: {
      type: String,
      enum: ["pending", "scheduled", "completed"],
      default: "pending",
    },

    sampleCollectionRequired: { type: Boolean, default: false },

    homeVisitRequired: { type: Boolean, default: false },

    assignedSlot: String,

    instructions: String,
  },
  { timestamps: true },
);

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;
