import { Router } from "express";
import mongoose from "mongoose";
import { Theatre } from "../models/Theatre.js";
import { Screen } from "../models/Screen.js";

const router = Router();

// GET /api/theatres - optional filter by city
router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city } : {};
    const theatres = await Theatre.find(filter).lean();
    res.json(theatres);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/theatres/:theatreId/screens
router.get("/:theatreId/screens", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.theatreId)) {
      return res.status(400).json({ error: "Invalid theatreId" });
    }
    const screens = await Screen.find({
      theatreId: req.params.theatreId,
    }).lean();
    res.json(screens);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
