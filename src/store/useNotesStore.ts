import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note } from '../types';

interface NotesState {
  notes: Note[];

  // CRUD operations
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'isPinned'>>) => void;
  deleteNote: (noteId: string) => void;

  // Filtering and search
  getAllNotes: () => Note[];
  getPinnedNotes: () => Note[];
  getNotesByTag: (tag: string) => Note[];
  getNotesByNode: (nodeId: string) => Note[];
  searchNotes: (query: string) => Note[];

  // Pin/unpin
  pinNote: (noteId: string) => void;
  unpinNote: (noteId: string) => void;
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

      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, ...updates, updatedAt: new Date() }
              : note
          ),
        }));
      },

      deleteNote: (noteId) => {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== noteId),
        }));
      },

      // Get all notes sorted by pinned first, then by updated date
      getAllNotes: () => {
        return get().notes.sort((a, b) => {
          // Pinned notes first
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          // Then by updated date (newest first)
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
      },

      getPinnedNotes: () => {
        return get().notes.filter(note => note.isPinned);
      },

      getNotesByTag: (tag) => {
        return get().notes.filter(note => note.tags.includes(tag));
      },

      getNotesByNode: (nodeId) => {
        return get().notes.filter(note => note.linkedNodeId === nodeId);
      },

      searchNotes: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().notes.filter(note =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      },

      pinNote: (noteId) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, isPinned: true, updatedAt: new Date() }
              : note
          ),
        }));
      },

      unpinNote: (noteId) => {
        set((state) => ({
          notes: state.notes.map(note =>
            note.id === noteId
              ? { ...note, isPinned: false, updatedAt: new Date() }
              : note
          ),
        }));
      },
    }),
    {
      name: 'notes-storage',
    }
  )
);
