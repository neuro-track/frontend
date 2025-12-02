import { Heart, Book, FileText, Trash2 } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useLearningStore } from '../store/useLearningStore';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';

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
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Favoritos"
          description="Seus cursos e lições favoritas em um só lugar"
          backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
          stats={[
            {
              label: 'Total',
              value: favorites.length,
            },
            {
              label: 'Cursos',
              value: favoriteCourses.length,
            },
            {
              label: 'Lições',
              value: favoriteNodes.length,
            },
          ]}
        />

        {favorites.length === 0 ? (
          <Card padding="lg">
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Você ainda não tem favoritos
              </p>
              <p className="text-gray-400 dark:text-gray-500 mt-2">
                Marque cursos e lições como favoritos para acessá-los rapidamente
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {favoriteCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Book className="w-6 h-6" />
                  Cursos Favoritos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteCourses.map(({ favorite, course }) => (
                    <Card
                      key={favorite.id}
                      hover
                      className="relative"
                    >
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-3 mb-3">
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
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {course!.description}
                      </p>
                      <button
                        onClick={() => navigate(`/course/${course!.id}`)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Ver Curso
                      </button>
                    </Card>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteNodes.map(({ favorite, node, course }) => (
                    <Card
                      key={favorite.id}
                      hover
                      className="relative"
                    >
                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {node!.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {course!.title}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        {node!.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          node!.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          node!.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
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
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
