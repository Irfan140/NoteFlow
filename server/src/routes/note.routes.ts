import { Router } from "express";
import { attachUserId, clerkAuth } from "../middlewares/clerkAuth";
import * as noteController from "../controllers/note.controller";
import { ensureUserExists } from "../middlewares/ensureUserExists.middleware";

const router = Router();

// All note routes requires Authentication
router.use(clerkAuth, attachUserId, ensureUserExists);

router.post("/", noteController.createNote);
router.get("/", noteController.getNotesByUserId);
router.get("/:noteId", noteController.getNoteByNoteId);
router.put("/:noteId", noteController.updateNote);
router.delete("/:noteId", noteController.deleteNote);
router.post("/:noteId/summarize", noteController.summarizeNote);

export default router;
