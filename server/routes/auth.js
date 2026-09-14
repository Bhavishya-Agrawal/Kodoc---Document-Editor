import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kodoc_super_secret_key";

// POST /api/auth/signup
// Register a new user
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide username, email, and password" });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user record
    user = new User({
      username,
      email,
      password,
    });

    // Save the user to MongoDB
    await user.save();

    // Create the JWT Payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token and return it
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Failed to generate token" });
      }
      // Send back the token and user details (excluding password)
      res.status(201).json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

// POST /api/auth/signin
// Authenticate user & get token
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // See if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create the JWT Payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // Sign the token and return it
    jwt.sign(payload, JWT_SECRET, { expiresIn: "5h" }, (err, token) => {
      if (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Failed to generate token" });
      }
      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
});

export default router;
