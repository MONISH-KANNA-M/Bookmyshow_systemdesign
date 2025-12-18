import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theatre",
      required: true,
    },
    name: { type: String, required: true },
    seatLabels: { type: [String], required: true },
  },
  { timestamps: true }
);

export const Screen = mongoose.model("Screen", screenSchema);
