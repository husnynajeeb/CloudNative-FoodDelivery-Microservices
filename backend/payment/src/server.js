import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";

// NOTE: make sure paymentRoutes.js uses `export` not `module.exports`
import paymentRoutes from "./Routes/paymentRoutes.js"; 


const app = express();

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:8081",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);




app.use('/payments', paymentRoutes);



// Read user ID from the cookie

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
  })
  .catch((err) => console.log(err));

 export default app