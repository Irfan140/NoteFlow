import express from "express";
import { clerkMiddleware } from "@clerk/express";
import noteRoutes from "./routes/note.routes";
import { logger } from "./libs/logger";

const app = express();

app.use(express.json());
app.use(clerkMiddleware());

// HTTP request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    logger.info(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        responseTimeMs: responseTime,
      },
      "request completed",
    );
  });

  next();
});

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "API is healthy",
  });
});

// Notes API
app.use("/notes", noteRoutes);

export default app;
