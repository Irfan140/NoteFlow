import type { Request, Response } from "express";
import * as noteService from "../services/note.service";
import { enqueueSummary, summaryQueue } from "../queues/summary.queue";

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const data = req.body;

    const note = await noteService.createNote(userId, data);

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error });
  }
};

export const getNotesByUserId = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const notes = await noteService.getNotesByUserId(userId);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notes" });
  }
};

// GET SINGLE NOTE
export const getNoteByNoteId = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const noteId = req.params.noteId;
    if (!noteId)
      return res.status(400).json({ error: "Missing noteId parameter" });

    const note = await noteService.getNoteByNoteId(noteId, userId);
    if (!note) return res.status(404).json({ error: "Note not found" });

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch note" });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const noteId = req.params.noteId;
    if (!noteId)
      return res.status(400).json({ error: "Missing noteId parameter" });
    const data = req.body;

    //  First check if note exists
    const existing = await noteService.getNoteByNoteId(noteId, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });

    const updated = await noteService.updateNote(noteId, userId, data);
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update note" });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const noteId = req.params.noteId;
    if (!noteId)
      return res.status(400).json({ error: "Missing noteId parameter" });

    const existing = await noteService.getNoteByNoteId(noteId, userId);
    if (!existing) return res.status(404).json({ error: "Note not found" });

    await noteService.deleteNote(noteId, userId);
    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete note" });
  }
};

// Summarize the notes
export const summarizeNote = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const noteId = req.params.noteId;

    if (!noteId) {
      return res.status(400).json({ error: "Missing noteId parameter" });
    }

    // Get the note
    const note = await noteService.getNoteByNoteId(noteId, userId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Check if note has content
    if (!note.content || note.content.trim().length < 10) {
      return res
        .status(400)
        .json({ error: "Note content is too short to summarize" });
    }

    const job = await enqueueSummary({
      noteId,
      userId,
      content: note.content,
    });

    res.status(202).json({ jobId: job.id, status: "queued" });
  } catch (error: any) {
    console.error("Summarization error:", error);
    res.status(500).json({
      error: "Failed to summarize note",
      message: error.message,
    });
  }
};

export const getSummaryStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const noteId = req.params.noteId;
    const jobId = req.params.jobId;

    if (!noteId || !jobId) {
      return res.status(400).json({ error: "Missing summary job parameters" });
    }

    const job = await summaryQueue.getJob(jobId);
    if (!job || job.data.noteId !== noteId || job.data.userId !== userId) {
      return res.status(404).json({ error: "Summary job not found" });
    }

    const state = await job.getState();
    if (state === "completed") {
      const note = await noteService.getNoteByNoteId(noteId, userId);
      return res.status(200).json({
        jobId,
        status: "completed",
        summary: note?.summary ?? null,
      });
    }

    if (state === "failed") {
      return res.status(200).json({
        jobId,
        status: "failed",
        error: job.failedReason || "Summary generation failed",
      });
    }

    return res.status(200).json({
      jobId,
      status: state === "active" ? "processing" : "queued",
    });
  } catch (error) {
    console.error("Summary status error:", error);
    return res.status(500).json({ error: "Failed to fetch summary status" });
  }
};
