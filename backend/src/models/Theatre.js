import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

export const Theatre = mongoose.model("Theatre", theatreSchema);
