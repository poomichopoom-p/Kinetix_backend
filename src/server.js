import express from "express"
import cors from "cors";
import helmet from "helmet";

import { router as apiRouter } from "./roues/index.js";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/mongoDB.js";

const corsOption = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
  ],
};
const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cookieParser());
app.use(cors());
app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Server is error!",
    path: req.originalUrl,
    method: req.method,
    timestamp: new Data().toISOString(),
    stack: err.stack,
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Kinetix");
});

app.use("/api", apiRouter);

await connectDB()

app.listen(PORT, () => {
  console.log(`Server is running or Port: ${PORT} !!`);
});
