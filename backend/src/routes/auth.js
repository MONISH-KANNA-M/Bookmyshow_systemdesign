import { Router } from "express";
import { User } from "../models/User.js";

const router = Router();

// POST /api/auth/signup { name, email }
router.post("/signup", async (req, res) => {
  const { name, email } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({
        userId: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      });
    }

    // Create new user
    const user = new User({ name, email });
    await user.save();

    return res.status(201).json({
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Signup failed" });
  }
});

// POST /api/auth/login { email }
router.post("/login", async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      userId: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Login failed" });
  }
});

export default router;
