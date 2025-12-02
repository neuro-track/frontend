import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLearningStore } from '../store/useLearningStore';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';
import {
  BookOpen,
  Clock,
  Star,
  Users,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react';

export const CoursesScreen = () => {
  const navigate = useNavigate();
  const { courses } = useLearningStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Web Development', 'Frontend Framework', 'Backend'];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Explorar Cursos"
          description="Descubra caminhos de aprendizado personalizados para seus objetivos"
          backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
        />

        {/* Search and Filters */}
        <Card>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar cursos..."
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Filter size={16} />
                <span>Filtrar por:</span>
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const completedCount = course.nodes.filter(
                (n) => n.status === 'completed'
              ).length;
              const totalCount = course.nodes.length;
              const totalMinutes = course.nodes.reduce(
                (sum, n) => sum + n.estimatedMinutes,
                0
              );
              const progressPercentage = Math.round(
                (completedCount / totalCount) * 100
              );

              return (
                <Card
                  key={course.id}
                  padding="none"
                  hover
                  onClick={() => navigate(`/course/${course.id}`)}
                  className="overflow-hidden group"
                >
                  {/* Course Image/Icon */}
                  <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-6xl">{course.icon}</div>
                  </div>

                  {/* Course Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
                        {course.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <span className="font-medium">4.8</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {Math.round(totalMinutes / 60)}h {totalMinutes % 60}min
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} />
                        {totalCount} lições
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        1.2k
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {progressPercentage > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Progresso</span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {progressPercentage > 0 ? 'Continuar' : 'Iniciar Curso'}
                      </span>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <BookOpen size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum curso encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar sua busca ou filtros
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
};
