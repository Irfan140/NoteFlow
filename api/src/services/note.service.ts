import { prisma } from "../config/db.ts";
import type { CreateNote, UpdateNote } from "../types/note.ts";

export const createNote = async (userId: string, data: CreateNote) => {
  return await prisma.note.create({
    data: {
      ...data,
      userId,
    },
  });
};

export const getNotesByUserId = async (userId: string) => {
  return await prisma.note.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getNoteByNoteId = async (noteId: string, userId: string) => {
  return await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
    },
  });
};

export const updateNote = async (
  noteId: string,
  userId: string,
  data: UpdateNote,
) => {
  return await prisma.note.update({
    where: {
      id: noteId,
      userId,
    },
    data,
  });
};

export const deleteNote = async (noteId: string, userId: string) => {
  return await prisma.note.delete({
    where: {
      id: noteId,
      userId,
    },
  });
};
