import { useState, useEffect, useRef } from 'react';
import { Search, X, Book, FileText } from 'lucide-react';
import { useLearningStore } from '../store/useLearningStore';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: 'course' | 'node';
  id: string;
  title: string;
  description: string;
  courseTitle?: string;
  difficulty?: string;
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const { courses } = useLearningStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    courses.forEach((course) => {
      if (course.title.toLowerCase().includes(searchQuery) ||
          course.description.toLowerCase().includes(searchQuery)) {
        searchResults.push({
          type: 'course',
          id: course.id,
          title: course.title,
          description: course.description,
        });
      }

      course.nodes.forEach((node) => {
        if (node.title.toLowerCase().includes(searchQuery) ||
            node.description.toLowerCase().includes(searchQuery) ||
            node.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
          searchResults.push({
            type: 'node',
            id: node.id,
            title: node.title,
            description: node.description,
            courseTitle: course.title,
            difficulty: node.difficulty,
          });
        }
      });
    });

    setResults(searchResults.slice(0, 10));
  }, [query, courses]);

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'course') {
      navigate(`/course/${result.id}`);
    } else {
      const course = courses.find(c => c.nodes.some(n => n.id === result.id));
      if (course) {
        navigate(`/lesson/${course.id}/${result.id}`);
      }
    }
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar cursos, lições ou tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query && results.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Nenhum resultado encontrado para "{query}"
            </div>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="w-full p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-start gap-3">
                  {result.type === 'course' ? (
                    <Book className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  ) : (
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </h4>
                      {result.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          result.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          result.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {result.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.description}
                    </p>
                    {result.courseTitle && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Curso: {result.courseTitle}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {results.length > 0 && (
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
            Mostrando {results.length} resultado{results.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
}
