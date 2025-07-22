import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import cors from "cors";
import bodyParser from "body-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import caseRoutes from "./routes/caseRoutes.js";
import hearingRoutes from "./routes/hearingRoutes.js";
import courtRoutes from "./routes/courtRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3001;

dotenv.config();
connectDB();
const app = express();

// CORS configuration for production and development
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/hearings", hearingRoutes);
app.use("/api/court", courtRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/comments", commentRoutes);

// Serve static files from React build (for production)
if (process.env.NODE_ENV === "production") {
  // Serve static files from client build
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
