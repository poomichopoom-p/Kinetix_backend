import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import { router as apiRouter } from "./routes/index.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoDB.js";
import { limiter } from "./middleware/rateLimit.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const corsOption = {
  origin: [
    "https://kineti-x-frontend.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());
app.use(cors(corsOption));
app.use(express.json());
app.use(limiter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server is error!",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });
});
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.get("/", (req, res) => {
  res.send("Welcome to Kinetix");
});
// http//localhost:5000/api
app.use("/api", apiRouter);

await connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on Port: ${PORT} !!`);
});
