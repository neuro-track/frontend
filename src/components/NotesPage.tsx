import { useState } from 'react';
import { StickyNote, Plus, Search, Tag, Pin, Edit2, Trash2, Save, X, PinOff } from 'lucide-react';
import { useNotesStore } from '../store/useNotesStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatDistanceToNow } from 'date-fns';
import { Note } from '../types';

export function NotesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const { getAllNotes, getPinnedNotes, searchNotes, getNotesByTag, addNote, updateNote, deleteNote, pinNote, unpinNote } = useNotesStore();
  const { user } = useAuthStore();

  // Get notes based on current filter
  const notes = searchQuery
    ? searchNotes(searchQuery)
    : selectedTag
    ? getNotesByTag(selectedTag)
    : getAllNotes();

  const pinnedNotes = getPinnedNotes();

  // Extract all unique tags from notes
  const allTags = Array.from(
    new Set(getAllNotes().flatMap(note => note.tags))
  ).sort();

  const handleAddNote = () => {
    if (!newContent.trim() || !user) return;

    const tags = newTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    addNote({
      userId: user.id,
      title: newTitle.trim() || 'Nota sem título',
      content: newContent,
      tags,
      isPinned: false,
    });

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setIsAddingNote(false);
  };

  const handleEditNote = (noteId: string) => {
    const tags = editTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    updateNote(noteId, {
      title: editTitle,
      content: editContent,
      tags,
    });

    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
    setEditTags('');
  };

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditTitle('');
    setEditContent('');
    setEditTags('');
  };

  const cancelAdd = () => {
    setIsAddingNote(false);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
  };

  const NoteCard = ({ note }: { note: Note }) => {
    const isEditing = editingNoteId === note.id;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
        {isEditing ? (
          <div className="space-y-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título da nota"
              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={6}
              className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
            />
            <input
              type="text"
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="Tags (separadas por vírgula)"
              className="w-full p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleEditNote(note.id)}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                <Save size={14} /> Salvar
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
              >
                <X size={14} /> Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {note.isPinned && <Pin size={16} className="text-yellow-600 dark:text-yellow-400" />}
                {note.title}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => note.isPinned ? unpinNote(note.id) : pinNote(note.id)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title={note.isPinned ? 'Desafixar' : 'Fixar'}
                >
                  {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                </button>
                <button
                  onClick={() => startEdit(note)}
                  className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm mb-3">
              {note.content}
            </p>
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {note.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    onClick={() => setSelectedTag(tag)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>{formatDistanceToNow(note.updatedAt, { addSuffix: true })}</span>
              {note.linkedNodeId && (
                <span className="text-purple-600 dark:text-purple-400">Vinculado à lição</span>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <StickyNote className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Minhas Notas</h1>
            </div>
            <button
              onClick={() => setIsAddingNote(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Nova Nota
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar notas..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
              />
            </div>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                <Tag size={16} />
                {selectedTag}
                <X size={14} />
              </button>
            )}
          </div>

          {/* Tags */}
          {allTags.length > 0 && !selectedTag && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tags:</span>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-xs"
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Note Form */}
        {isAddingNote && (
          <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Nova Nota</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título da nota"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Conteúdo da nota..."
                rows={6}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white resize-none"
              />
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="Tags (separadas por vírgula)"
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Save size={16} />
                  Salvar Nota
                </button>
                <button
                  onClick={cancelAdd}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && !searchQuery && !selectedTag && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Pin size={18} className="text-yellow-600 dark:text-yellow-400" />
              Fixadas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pinnedNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        )}

        {/* All Notes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            {searchQuery
              ? `Resultados da busca (${notes.length})`
              : selectedTag
              ? `Notas com tag "${selectedTag}" (${notes.length})`
              : `Todas as Notas (${notes.length})`}
          </h2>
          {notes.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <StickyNote className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">Nenhuma nota encontrada</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setIsAddingNote(true);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Criar sua primeira nota
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.filter(n => !n.isPinned || searchQuery || selectedTag).map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
