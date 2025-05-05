import express from "express";
import dotenv from "dotenv";
import colors from "colors";
dotenv.config();
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
const port = process.env.PORT || 3001;

connectDB();
const app = express();

app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
