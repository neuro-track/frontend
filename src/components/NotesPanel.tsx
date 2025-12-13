import { useState } from 'react';
import { StickyNote, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useNotesStore } from '../store/useNotesStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';

interface NotesPanelProps {
  nodeId: string;
  courseId: string;
}

export function NotesPanel({ nodeId, courseId }: NotesPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const { addNote, updateNote, deleteNote, getNotesByNode } = useNotesStore();
  const { user } = useAuthStore();
  const nodeNotes = getNotesByNode(nodeId);

  const handleAddNote = () => {
    if (!newNoteContent.trim() || !user) return;

    addNote({
      userId: user.id,
      title: newNoteTitle.trim() || 'Nota sem título',
      content: newNoteContent,
      tags: [],
      linkedNodeId: nodeId,
      linkedCourseId: courseId,
      isPinned: false,
    });

    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAdding(false);
  };

  const handleEditNote = (noteId: string) => {
    updateNote(noteId, {
      title: editTitle,
      content: editContent
    });
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
  };

  const startEdit = (note: { id: string; title: string; content: string }) => {
    setEditingId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Minhas Anotações</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({nodeNotes.length})
          </span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Nota
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={newNoteTitle}
            onChange={(e) => setNewNoteTitle(e.target.value)}
            placeholder="Título da nota (opcional)"
            className="w-full p-3 mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
          />
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder="Digite sua anotação..."
            className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
            rows={4}
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddNote}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Save className="w-4 h-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewNoteTitle('');
                setNewNoteContent('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {nodeNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma anotação ainda</p>
            <p className="text-sm mt-1">Clique em "Nova Nota" para começar</p>
          </div>
        ) : (
          nodeNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 rounded"
            >
              {editingId === note.id ? (
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título da nota"
                    className="w-full p-3 mb-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                  />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditTitle('');
                        setEditContent('');
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {note.title && (
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {note.title}
                    </h4>
                  )}
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
