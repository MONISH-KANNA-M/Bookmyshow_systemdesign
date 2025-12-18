import { Router } from "express";
import mongoose from "mongoose";
import { Show } from "../models/Show.js";
import { Movie } from "../models/Movie.js";

const router = Router();

// GET /api/shows/by-movie/:movieId - get shows by movie
router.get("/by-movie/:movieId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.movieId)) {
      return res.status(400).json({ error: "Invalid movieId" });
    }
    const shows = await Show.find({ movieId: req.params.movieId })
      .populate("movieId", "title")
      .populate("screenId", "theatreId name seatLabels")
      .lean();
    res.json(shows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/shows/:showId - get single show details
router.get("/:showId", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.showId)) {
      return res.status(400).json({ error: "Invalid showId" });
    }
    const show = await Show.findById(req.params.showId)
      .populate("movieId")
      .populate("screenId")
      .lean();
    if (!show) return res.status(404).json({ error: "Show not found" });
    res.json(show);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
