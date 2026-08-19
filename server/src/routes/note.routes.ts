import { Router } from "express";
import { jwtAuth } from "../middlewares/auth";
import * as noteController from "../controllers/note.controller";
import { notesRateLimiter, summarizeRateLimiter } from "../libs/rate-limiter";

const router = Router();

router.use(notesRateLimiter);

// All note routes require Authentication
router.use(jwtAuth);

router.post("/", noteController.createNote);
router.get("/", noteController.getNotesByUserId);
router.get("/:noteId", noteController.getNoteByNoteId);
router.put("/:noteId", noteController.updateNote);
router.delete("/:noteId", noteController.deleteNote);
router.post("/:noteId/summarize", summarizeRateLimiter, noteController.summarizeNote);
router.get("/:noteId/summarize/:jobId", noteController.getSummaryStatus);

export default router;
