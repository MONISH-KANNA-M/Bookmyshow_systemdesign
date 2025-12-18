import mongoose from "mongoose";

const seatHoldSchema = new mongoose.Schema(
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
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
seatHoldSchema.index({ showId: 1 });

export const SeatHold = mongoose.model("SeatHold", seatHoldSchema);
