import { Router } from "express";
import mongoose from "mongoose";
import { Show } from "../models/Show.js";
import { Screen } from "../models/Screen.js";
import { SeatReservation } from "../models/SeatReservation.js";
import { SeatHold } from "../models/SeatHold.js";

const router = Router();

// GET /api/shows/:showId/seats
router.get("/:showId/seats", async (req, res) => {
  const { showId } = req.params;
  if (!mongoose.isValidObjectId(showId))
    return res.status(400).json({ error: "Invalid showId" });

  const show = await Show.findById(showId).lean();
  if (!show) return res.status(404).json({ error: "Show not found" });
  const screen = await Screen.findById(show.screenId).lean();
  if (!screen) return res.status(404).json({ error: "Screen not found" });

  const [reservations, holds] = await Promise.all([
    SeatReservation.find({ showId }).lean(),
    SeatHold.find({ showId, expiresAt: { $gt: new Date() } }).lean(),
  ]);

  const bookedSeats = new Set(reservations.map((r) => r.seat));
  const heldSeats = new Set(holds.flatMap((h) => h.seats));

  res.json({
    totalSeats: screen.seatLabels.length,
    seatLabels: screen.seatLabels,
    bookedSeats: Array.from(bookedSeats),
    heldSeats: Array.from(heldSeats),
  });
});

export default router;
