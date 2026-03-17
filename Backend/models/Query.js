import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: "appointment" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  message: String,
  createdAt: { type: Date, default: Date.now },
});

const queryModel = mongoose.models.query || mongoose.model("query", querySchema);

export default queryModel;
