import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();
const app = express();

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import seedAdminUser from "./utils/seedAdmin.js";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5001;
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    if (process.env.AUTO_SEED_ADMIN === "true") {
      try {
        await seedAdminUser();
        console.log("Admin user check completed");
      } catch (error) {
        console.error("Error checking admin user:", error.message);
      }
    }
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
