import { Router } from "express";
import mongoose from "mongoose";
import { SeatHold } from "../models/SeatHold.js";
import { Show } from "../models/Show.js";
import { emitShowEvent } from "../utils/io.js";

const router = Router();

// POST /api/holds { userId, showId, seats[] }
router.post("/", async (req, res) => {
  const { userId, showId, seats } = req.body || {};
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(showId) ||
    !Array.isArray(seats) ||
    seats.length === 0
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const show = await Show.findById(showId).lean();
  if (!show) return res.status(404).json({ error: "Show not found" });

  // Check for overlapping active holds
  const now = new Date();
  const overlap = await SeatHold.exists({
    showId,
    expiresAt: { $gt: now },
    seats: { $in: seats },
  });
  if (overlap)
    return res
      .status(409)
      .json({ error: "Some seats currently held by other users" });

  // Create hold for 2 minutes
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000);
  const hold = await SeatHold.create({ userId, showId, seats, expiresAt });

  // Notify clients watching this show
  emitShowEvent(showId, "seat_hold_created", {
    showId,
    seats,
    expiresAt,
    holdId: hold._id,
  });

  // No hard reservation yet; client will attempt booking
  res.status(201).json({ holdId: hold._id, expiresAt });
});

export default router;
