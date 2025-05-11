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
import connectDB from "./config/db.js";
const port = process.env.PORT || 3001;

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/hearings", hearingRoutes);
app.use("/api/court", courtRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/report", reportRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
