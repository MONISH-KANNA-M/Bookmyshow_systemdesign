import mongoose from "mongoose";

const seatReservationSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seat: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  },
  { timestamps: true }
);

seatReservationSchema.index({ showId: 1, seat: 1 }, { unique: true });

export const SeatReservation = mongoose.model(
  "SeatReservation",
  seatReservationSchema
);
