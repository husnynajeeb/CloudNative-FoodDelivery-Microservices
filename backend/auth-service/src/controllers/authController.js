import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config(); // Make sure this is loaded

// REGISTER CONTROLLER
export const register = async (req, res) => {
  try {
    let { name, phone, email, password, role } = req.body;

    // Normalize email (lowercase & trim)
    email = email.toLowerCase().trim();

    // Check if user exists by phone or email
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      ...req.body
    });

    await user.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: err.message || "Something went wrong during registration." });
  }
};

// LOGIN CONTROLLER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        vehicleType: user.vehicleType,
        vehiclePlate: user.vehiclePlate
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message || "Something went wrong during login." });
  }
};
