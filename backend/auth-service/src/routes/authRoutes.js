import express from "express";
import {
  registerCustomer,
  registerRestaurant,
  registerAdmin,
  getAllRestaurants,
  login,
  registerDriver,
  getDriverById,
  AllRestaurants,
  getRestaurantById,
  updateProfile,
  deleteProfile,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// routes/authRoutes.js
router.post("/register/customer", registerCustomer);
router.post("/register/restaurant", registerRestaurant);
router.post("/register/admin", registerAdmin);
router.post("/login", login);
router.post("/register/driver", registerDriver);
router.get("/restaurants", getAllRestaurants);
router.get("/drivers/:id", getDriverById);
router.get("/Restaurants", AllRestaurants);
router.get("/Restaurants/:id", getRestaurantById);
router.put("/update-profile", authMiddleware, updateProfile); // Update profile route')
router.delete("/delete-profile", authMiddleware, deleteProfile); // Delete profile route

export default router;
