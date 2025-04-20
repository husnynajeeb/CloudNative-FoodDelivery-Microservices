import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import axios from "axios"; // HTTP client to communicate with another microservice
dotenv.config();

// ======================
// REGISTER
// ======================
export const register = async (req, res) => {
  try {
    let { name, phone, email, password, role, location } = req.body;

    // Normalize email
    email = email.toLowerCase().trim();

    // Check for existing user by phone or email
    const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Validate location if provided
    if (location) {
      if (
        !location.type ||
        location.type !== "Point" ||
        !Array.isArray(location.coordinates) ||
        location.coordinates.length !== 2
      ) {
        return res.status(400).json({ message: "Invalid location format" });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const user = new User({
      name,
      phone,
      email,
      password: hashedPassword,
      role,
      location: location || undefined // allow optional location
    });

    const savedUser = await user.save();


    // If role is 'delivery', create the driver in the delivery microservice
    if (role === 'delivery') {
      const driverData = {
        userId: savedUser._id,
        name,
        currentLocation: location || { type: 'Point', coordinates: [0, 0] },  // Default to [0, 0] if no location
        status: 'available',
        rating: 5.0,
        deliveriesCompleted: 0,
      };

      try {
        // Make API call to create a Driver in the delivery microservice
        const response = await axios.post("http://localhost:5003/api/delivery/driver", driverData);
        console.log("Driver created:", response.data);
      } catch (error) {
        console.error("Error creating driver:", error);
        return res.status(500).json({ error: "Failed to create driver in delivery service" });
      }
    }

     // Send success response after user (and driver, if applicable) creation
     res.status(201).json({ message: "Registered successfully", user: savedUser });

    } catch (err) {
      console.error("🔴 Registration Error:", err);
      res.status(500).json({ error: err.message || "Registration failed." });
    }
  };


// ======================
// LOGIN
// ======================
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
        vehiclePlate: user.vehiclePlate,
        location: user.location,
      },
    });
  } catch (err) {
    console.error("🔴 Login Error:", err);
    res.status(500).json({ error: err.message || "Login failed." });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error("🔴 Error fetching user by ID:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
