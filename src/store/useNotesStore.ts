import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '../types';

interface NotesState {
  notes: Note[];

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, content: string) => void;
  deleteNote: (noteId: string) => void;
  getNotesByNode: (nodeId: string) => Note[];
  getNotesByCourse: (courseId: string) => Note[];
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },

      updateNote: (noteId, content) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, content, updatedAt: new Date() }
              : note
          ),
        }));
      },

      deleteNote: (noteId) => {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== noteId),
        }));
      },

      getNotesByNode: (nodeId) => {
        return get().notes.filter(note => note.nodeId === nodeId);
      },

      getNotesByCourse: (courseId) => {
        return get().notes.filter(note => note.courseId === courseId);
      },
    }),
    {
      name: 'notes-storage',
    }
  )
);
