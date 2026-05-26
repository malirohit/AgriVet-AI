import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({

  profilePicture: {
    type: String,
    default: "",
  },

  name: String,

  email: {
    type: String,
    unique: true,
  },

  contactNumber: {
    type: String,
    required: true,
  },

  password: String,

  role: {
    type: String,
    enum: ["farmer", "doctor"],
    default: "farmer",
  },

  village: String,

  city: String,

  district: String,

  specialization: String, // only for doctors

  doctorAvailability: {
    monday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
    tuesday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
    wednesday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
    thursday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
    friday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
    saturday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
    sunday: {
      enabled: { type: Boolean, default: false },
      start: String,
      end: String,
    },
  },
  
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
