import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUserProfileStore, LearningGoal, LearningPace } from '../store/useUserProfileStore';
import { Navbar } from './Navbar';
import {
  Mail,
  Clock,
  Target,
  TrendingUp,
  Edit2,
  Save,
  X,
  Calendar,
  Award,
  BarChart3,
  Zap,
  Brain,
  BookOpen,
  CheckCircle,
} from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { profile, completeOnboarding, syncToSupabase, loadFromSupabase } = useUserProfileStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    targetRole: profile.targetRole,
    learningGoal: profile.learningGoal,
    availableHoursPerWeek: profile.availableHoursPerWeek,
    preferredPace: profile.preferredPace,
  });

  // Load profile from Supabase on mount
  useEffect(() => {
    if (user?.id) {
      loadFromSupabase(user.id);
    }
  }, [user?.id, loadFromSupabase]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSave = async () => {
    if (editedProfile.learningGoal && editedProfile.preferredPace) {
      completeOnboarding({
        learningGoal: editedProfile.learningGoal,
        targetRole: editedProfile.targetRole,
        availableHoursPerWeek: editedProfile.availableHoursPerWeek,
        preferredPace: editedProfile.preferredPace,
      });

      // Sync to Supabase
      await syncToSupabase();
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      targetRole: profile.targetRole,
      learningGoal: profile.learningGoal,
      availableHoursPerWeek: profile.availableHoursPerWeek,
      preferredPace: profile.preferredPace,
    });
    setIsEditing(false);
  };

  // Calculate stats
  const joinedDate = new Date(user.joinedAt);
  const daysActive = Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));
  const completionPercentage = profile.totalNodesCompleted > 0
    ? Math.round((profile.averageCompletionRate * 100))
    : 0;

  // Get top interests
  const topInterests = Object.entries(profile.interestTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full ring-4 ring-blue-100 dark:ring-blue-900"
              />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {user.name}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Membro há {daysActive} dias</span>
                </div>
              </div>
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar Perfil
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {profile.totalNodesCompleted}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Lições Completas</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {completionPercentage}%
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Taxa de Sucesso</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {Math.round(profile.consistencyScore * 100)}%
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">Consistência</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {profile.totalNodesCompleted * 100}
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">XP Total</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Preferências de Aprendizado
              </h2>
            </div>

            <div className="space-y-4">
              {/* Target Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cargo Alvo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.targetRole}
                    onChange={(e) => setEditedProfile({ ...editedProfile, targetRole: e.target.value })}
                    placeholder="ex: React Developer, Full Stack Engineer"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.targetRole || 'Não definido'}
                  </p>
                )}
              </div>

              {/* Learning Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Objetivo de Aprendizado
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.learningGoal || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, learningGoal: e.target.value as LearningGoal })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="fullstack">Full Stack Developer</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="mobile">Mobile Developer</option>
                    <option value="data">Data Scientist</option>
                    <option value="custom">Custom Learning Path</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.learningGoal
                      ? profile.learningGoal.charAt(0).toUpperCase() + profile.learningGoal.slice(1)
                      : 'Não definido'}
                  </p>
                )}
              </div>

              {/* Available Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Horas por Semana
                  </div>
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={editedProfile.availableHoursPerWeek}
                    onChange={(e) => setEditedProfile({ ...editedProfile, availableHoursPerWeek: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.availableHoursPerWeek} horas/semana
                  </p>
                )}
                {!isEditing && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    ≈ {profile.suggestedDailyMinutes} minutos por dia
                  </p>
                )}
              </div>

              {/* Learning Pace */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ritmo de Aprendizado
                </label>
                {isEditing ? (
                  <select
                    value={editedProfile.preferredPace || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, preferredPace: e.target.value as LearningPace })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="">Selecione...</option>
                    <option value="sprint">Sprint Mode (15+ hrs/week)</option>
                    <option value="steady">Steady Pace (8-15 hrs/week)</option>
                    <option value="explorer">Explorer (&lt;8 hrs/week)</option>
                  </select>
                ) : (
                  <p className="text-gray-900 dark:text-white font-medium">
                    {profile.preferredPace
                      ? profile.preferredPace.charAt(0).toUpperCase() + profile.preferredPace.slice(1)
                      : 'Não definido'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Learning Style */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Estilo de Aprendizado
                </h2>
              </div>

              <div className="space-y-4">
                {/* Theory vs Practice */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Prática</span>
                    <span className="text-gray-600 dark:text-gray-400">Teoria</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${profile.learningStyle.prefersTheory * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {profile.learningStyle.prefersTheory > 0.6 ? 'Foca em teoria' :
                     profile.learningStyle.prefersTheory < 0.4 ? 'Foca em prática' :
                     'Equilibrado'}
                  </p>
                </div>

                {/* Projects vs Assessments */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Avaliações</span>
                    <span className="text-gray-600 dark:text-gray-400">Projetos</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${profile.learningStyle.prefersProjects * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {profile.learningStyle.prefersProjects > 0.6 ? 'Prefere projetos' :
                     profile.learningStyle.prefersProjects < 0.4 ? 'Prefere avaliações' :
                     'Equilibrado'}
                  </p>
                </div>

                {/* Difficulty Tolerance */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Fácil</span>
                    <span className="text-gray-600 dark:text-gray-400">Desafiador</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${profile.learningStyle.difficultyTolerance * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                    {profile.learningStyle.difficultyTolerance > 0.6 ? 'Busca desafios' :
                     profile.learningStyle.difficultyTolerance < 0.4 ? 'Prefere conforto' :
                     'Equilibrado'}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  💡 Seu estilo de aprendizado é detectado automaticamente baseado no seu comportamento.
                </p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Métricas de Performance
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Taxa de Conclusão</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(profile.averageCompletionRate * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Score de Consistência</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(profile.consistencyScore * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Score de Exploração</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round(profile.explorationScore * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interests & Knowledge Gaps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Interests */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Principais Interesses
              </h2>
            </div>

            {topInterests.length > 0 ? (
              <div className="space-y-3">
                {topInterests.map(([tag, score]) => (
                  <div key={tag}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-900 dark:text-white capitalize">{tag}</span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Complete algumas lições para descobrir seus interesses!
              </p>
            )}
          </div>

          {/* Knowledge Gaps */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Lacunas de Conhecimento
              </h2>
            </div>

            {profile.knowledgeGaps.length > 0 ? (
              <div className="space-y-2">
                {profile.knowledgeGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-orange-600 rounded-full" />
                    <span className="text-gray-900 dark:text-white">{gap}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Converse com a IA para identificar áreas de aprendizado!
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
