import { Router } from "express";
import { Movie } from "../models/Movie.js";

const router = Router();

// GET /api/movies - list all movies
router.get("/", async (req, res) => {
  try {
    const movies = await Movie.find({}).lean();
    res.json(movies);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/movies/:movieId
router.get("/:movieId", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId).lean();
    if (!movie) return res.status(404).json({ error: "Movie not found" });
    res.json(movie);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
