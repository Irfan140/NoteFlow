import express from "express";
import { clerkMiddleware } from "@clerk/express";
import noteRoutes from "./routes/note.routes";

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "API is healthy",
  });
});

// Notes API
app.use("/notes", noteRoutes);

export default app;
