import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: { type: [String], required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Booking = mongoose.model("Booking", bookingSchema);
