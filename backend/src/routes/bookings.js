import { Router } from "express";
import mongoose from "mongoose";
import { SeatHold } from "../models/SeatHold.js";
import { SeatReservation } from "../models/SeatReservation.js";
import { Booking } from "../models/Booking.js";
import { emitShowEvent } from "../utils/io.js";

const router = Router();

// POST /api/bookings { userId, showId, holdId }
router.post("/", async (req, res) => {
  const { userId, showId, holdId } = req.body || {};
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(showId) ||
    !mongoose.isValidObjectId(holdId)
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // Check if replica set is available for transactions
  const useTransactions = process.env.MONGODB_URI?.includes("replicaSet");

  try {
    let resultBookingId = null;

    if (useTransactions) {
      // Use transactions if replica set is available
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(
          async () => {
            const hold = await SeatHold.findById(holdId).session(session);
            if (!hold)
              throw Object.assign(new Error("Hold not found"), { status: 404 });
            if (
              hold.userId.toString() !== userId ||
              hold.showId.toString() !== showId
            ) {
              throw Object.assign(new Error("Hold not owned"), { status: 403 });
            }
            if (hold.expiresAt.getTime() <= Date.now()) {
              throw Object.assign(new Error("Hold expired"), { status: 409 });
            }

            const seats = hold.seats;

            // Try to reserve all seats (hard guarantee via unique index)
            await SeatReservation.insertMany(
              seats.map((seat) => ({ showId, seat })),
              { session }
            ).catch((e) => {
              if (e?.code === 11000) {
                throw Object.assign(new Error("Seat(s) already booked"), {
                  status: 409,
                });
              }
              throw e;
            });

            const amount = seats.length * 200;
            const booking = await Booking.create(
              [{ userId, showId, seats, amount }],
              { session }
            );
            const bookingId = booking[0]._id;
            resultBookingId = bookingId;

            await SeatReservation.updateMany(
              { showId, seat: { $in: seats } },
              { $set: { bookingId } },
              { session }
            );

            await SeatHold.deleteOne({ _id: holdId }).session(session);
          },
          { writeConcern: { w: "majority" } }
        );
      } finally {
        session.endSession();
      }
    } else {
      // Fallback: No transactions (for standalone MongoDB)
      const hold = await SeatHold.findById(holdId);
      if (!hold) return res.status(404).json({ error: "Hold not found" });
      if (
        hold.userId.toString() !== userId ||
        hold.showId.toString() !== showId
      ) {
        return res.status(403).json({ error: "Hold not owned" });
      }
      if (hold.expiresAt.getTime() <= Date.now()) {
        return res.status(409).json({ error: "Hold expired" });
      }

      const seats = hold.seats;

      // Try to reserve all seats
      try {
        await SeatReservation.insertMany(
          seats.map((seat) => ({ showId, seat }))
        );
      } catch (e) {
        if (e?.code === 11000) {
          return res.status(409).json({ error: "Seat(s) already booked" });
        }
        throw e;
      }

      const amount = seats.length * 200;
      const booking = await Booking.create({ userId, showId, seats, amount });
      resultBookingId = booking._id;

      await SeatReservation.updateMany(
        { showId, seat: { $in: seats } },
        { $set: { bookingId: resultBookingId } }
      );

      await SeatHold.deleteOne({ _id: holdId });
    }

    emitShowEvent(showId, "seat_booked", {
      showId,
      bookingId: resultBookingId,
    });
    return res.status(201).json({ bookingId: resultBookingId });
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "Booking failed" });
  }
});

export default router;
