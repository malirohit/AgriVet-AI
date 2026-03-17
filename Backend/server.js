import express from "express";
import cors from "cors";

import dotenv from "dotenv";
import connectDB from "./config/mongodb.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 1002;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.send("API Working");
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/doctor", doctorRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});