import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["farmer", "doctor"], default: "farmer" },
  village: String,
  city: String,
  district: String,
  specialization: String, // only for doctors
});

userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  
});


const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
