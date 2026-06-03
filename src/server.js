import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { router as apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoDB.js";
import { limiter } from "./middelware/rateLimit.js";
import { globalErrorHandler } from "./middelware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corsOption = {
  origin: [
    "https://kinetix-qnx5.onrender.com",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOption));
app.use(express.json());
app.use(limiter);

// Serve uploaded proof-of-delivery images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
  res.send("Welcome to Kinetix");
});

// http://localhost:5000/api
app.use("/api", apiRouter);

// Global error handler — MUST be registered after all routes
app.use(globalErrorHandler);

await connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT} !!`);
});
