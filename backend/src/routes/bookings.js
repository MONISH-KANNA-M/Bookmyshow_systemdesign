import { Router } from "express";
import mongoose from "mongoose";
import { SeatHold } from "../models/SeatHold.js";
import { SeatReservation } from "../models/SeatReservation.js";
import { Booking } from "../models/Booking.js";
import { Show } from "../models/Show.js";
import { Movie } from "../models/Movie.js";
import { Screen } from "../models/Screen.js";
import { Theatre } from "../models/Theatre.js";
import { emitShowEvent } from "../utils/io.js";
import { generateTicketNumber } from "../utils/ticketGenerator.js";

const router = Router();

router.post("/", async (req, res) => {
  const { userId, showId, holdId } = req.body || {};
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(showId) ||
    !mongoose.isValidObjectId(holdId)
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const useTransactions = process.env.MONGODB_URI?.includes("replicaSet");

  try {
    let resultBookingId = null;

    if (useTransactions) {
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
            const ticketNumber = generateTicketNumber();
            const booking = await Booking.create(
              [{ userId, showId, seats, amount, ticketNumber }],
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
      const ticketNumber = generateTicketNumber();
      const booking = await Booking.create({
        userId,
        showId,
        seats,
        amount,
        ticketNumber,
      });
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

    // Fetch the complete booking with ticket number
    const booking = await Booking.findById(resultBookingId).lean();

    return res.status(201).json({
      bookingId: resultBookingId,
      ticketNumber: booking.ticketNumber,
      message: "Booking confirmed! Your ticket has been generated.",
    });
  } catch (e) {
    const status = e.status || 500;
    return res.status(status).json({ error: e.message || "Booking failed" });
  }
});

// GET /api/bookings/:bookingId/ticket - Get ticket details
router.get("/:bookingId/ticket", async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!mongoose.isValidObjectId(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "showId",
        populate: [
          { path: "movieId" },
          {
            path: "screenId",
            populate: { path: "theatreId" },
          },
        ],
      })
      .populate("userId", "name email")
      .lean();

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Format ticket details
    const ticket = {
      ticketNumber: booking.ticketNumber,
      bookingId: booking._id,
      status: booking.status,
      movieTitle: booking.showId.movieId.title,
      language: booking.showId.movieId.language,
      certificate: booking.showId.movieId.certificate,
      duration: booking.showId.movieId.durationMins,
      theatre: booking.showId.screenId.theatreId.name,
      city: booking.showId.screenId.theatreId.city,
      screen: booking.showId.screenId.name,
      showTime: booking.showId.startTime,
      seats: booking.seats,
      amount: booking.amount,
      bookedAt: booking.createdAt,
      customerName: booking.userId.name,
      customerEmail: booking.userId.email,
    };

    res.json(ticket);
  } catch (e) {
    res.status(500).json({ error: e.message || "Failed to fetch ticket" });
  }
});

export default router;
