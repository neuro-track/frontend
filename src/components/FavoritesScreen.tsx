import { Heart, Book, FileText, Trash2 } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useLearningStore } from '../store/useLearningStore';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';

export function FavoritesScreen() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const { courses, getNodeById } = useLearningStore();
  const navigate = useNavigate();

  const favoriteCourses = favorites
    .filter(fav => fav.resourceType === 'course')
    .map(fav => ({
      favorite: fav,
      course: courses.find(c => c.id === fav.resourceId),
    }))
    .filter(item => item.course);

  const favoriteNodes = favorites
    .filter(fav => fav.resourceType === 'node')
    .map(fav => {
      const node = getNodeById(fav.resourceId);
      const course = courses.find(c => c.nodes.some(n => n.id === fav.resourceId));
      return {
        favorite: fav,
        node,
        course,
      };
    })
    .filter(item => item.node);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Favoritos
          </h1>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Você ainda não tem favoritos
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              Marque cursos e lições como favoritos para acessá-los rapidamente
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {favoriteCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Book className="w-6 h-6" />
                  Cursos Favoritos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteCourses.map(({ favorite, course }) => (
                    <div
                      key={favorite.id}
                      className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{course!.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {course!.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {course!.category}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFavorite(favorite.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {course!.description}
                      </p>
                      <button
                        onClick={() => navigate(`/course/${course!.id}`)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ver Curso
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {favoriteNodes.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6" />
                  Lições Favoritas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteNodes.map(({ favorite, node, course }) => (
                    <div
                      key={favorite.id}
                      className="bg-white dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {node!.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {course!.title}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFavorite(favorite.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {node!.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded ${
                          node!.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          node!.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {node!.difficulty}
                        </span>
                        <button
                          onClick={() => navigate(`/lesson/${course!.id}/${node!.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Ver Lição
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
