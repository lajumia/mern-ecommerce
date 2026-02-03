import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import connectDB from "./config/connectDB.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();

// --------------------
// MIDDLEWARES
// --------------------

// Enable CORS
app.use(cors());

// Parse JSON requests
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// HTTP request logger (dev only)
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP for now to avoid breaking frontend
  })
);

// --------------------
// ROUTES
// --------------------

app.use("/api/v1/user", userRoutes);

// --------------------
// 404 handler for unknown routes
// --------------------
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.originalUrl} on this server. Use /api/v1 endpoints.`,
  });
});

// --------------------
// GLOBAL ERROR HANDLER (optional but recommended)
// --------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------------
// CONNECT TO DB AND START SERVER
// --------------------
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
