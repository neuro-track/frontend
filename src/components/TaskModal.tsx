import { useState, useEffect } from 'react';
import { Task } from '../types';
import { X, Play, BookOpen, ExternalLink, Code, CheckCircle, Target, ClipboardList } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useLearningStore } from '../store/useLearningStore';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  onComplete: (task: Task, submission?: string, score?: number) => void;
}

export const TaskModal = ({ task, onClose, onComplete }: TaskModalProps) => {
  const [enrichedTask, setEnrichedTask] = useState<Task>(task);
  const [isEnriching, setIsEnriching] = useState(false);
  const [userCode, setUserCode] = useState(task.userSubmission || task.content?.starterCode || '');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const getNodeById = useLearningStore((state) => state.getNodeById);

  // Enrich task content when modal opens
  useEffect(() => {
    const enrichContent = async () => {
      // Get node to extract topic
      const node = getNodeById(task.nodeId);
      if (!node) return;

      // Only enrich if task doesn't have rich content yet
      const needsEnrichment =
        (task.type === 'exercise' && !task.content?.exercise) ||
        (task.type === 'reading' && !task.content?.reading);

      if (needsEnrichment) {
        setIsEnriching(true);
        try {
          const enriched = await aiService.enrichTaskContent(task, node.title);
          setEnrichedTask(enriched);
        } catch (error) {
          console.error('Failed to enrich task:', error);
          // Keep original task on error
        } finally {
          setIsEnriching(false);
        }
      }
    };

    enrichContent();
  }, [task, getNodeById]);

  const handleSubmit = () => {
    if (task.type === 'coding-challenge') {
      // Submit code
      onComplete(task, userCode);
    } else if (task.type === 'quiz') {
      // Grade quiz
      const score = calculateQuizScore(selectedAnswers);
      setShowResults(true);
      // Wait a bit before completing to show results
      setTimeout(() => {
        onComplete(task, undefined, score);
      }, 2000);
    } else {
      // Mark as completed (reading/video-watch)
      onComplete(task);
    }
  };

  const calculateQuizScore = (answers: number[]): number => {
    const questions = enrichedTask.content?.questions || [];
    const correct = answers.filter((ans, idx) => ans === questions[idx]?.correctAnswer).length;
    return Math.round((correct / questions.length) * 100);
  };

  const getTaskIcon = () => {
    switch (task.type) {
      case 'coding-challenge':
        return <Code size={24} className="text-purple-600" />;
      case 'quiz':
        return <BookOpen size={24} className="text-blue-600" />;
      case 'reading':
        return <BookOpen size={24} className="text-green-600" />;
      case 'video-watch':
        return <Play size={24} className="text-red-600" />;
      default:
        return <BookOpen size={24} className="text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-3">
            {getTaskIcon()}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {task.difficulty === 'easy' ? 'Fácil' : task.difficulty === 'medium' ? 'Médio' : 'Difícil'} • {task.estimatedMinutes} min
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
            {task.description}
          </p>

          {/* Loading state while enriching content */}
          {isEnriching && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Carregando conteúdo educacional...
                </p>
              </div>
            </div>
          )}

          {/* Coding Challenge */}
          {!isEnriching && task.type === 'coding-challenge' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Editor de Código
              </h3>
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-64 p-4 font-mono text-sm bg-gray-900 text-green-400 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="// Escreva seu código aqui..."
                spellCheck={false}
              />

              {/* Test Cases */}
              {task.content?.testCases && task.content.testCases.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Casos de Teste:
                  </h4>
                  <div className="space-y-2">
                    {task.content.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="text-sm bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-gray-600 dark:text-gray-400 mb-1">
                          {tc.description}
                        </p>
                        <code className="text-xs">
                          <span className="text-blue-600 dark:text-blue-400">Input:</span>{' '}
                          {JSON.stringify(tc.input)} →{' '}
                          <span className="text-green-600 dark:text-green-400">Output:</span>{' '}
                          {JSON.stringify(tc.expectedOutput)}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quiz */}
          {task.type === 'quiz' && (
            <div className="space-y-4">
              {task.content?.questions?.map((q, qIdx) => {
                const isCorrect = showResults && selectedAnswers[qIdx] === q.correctAnswer;
                const isWrong = showResults && selectedAnswers[qIdx] !== q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 transition-colors ${
                      isCorrect
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : isWrong
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white mb-3">
                      {qIdx + 1}. {q.question}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((option, oIdx) => {
                        const isSelected = selectedAnswers[qIdx] === oIdx;
                        const isCorrectOption = oIdx === q.correctAnswer;
                        const showCorrect = showResults && isCorrectOption;
                        const showWrong = showResults && isSelected && !isCorrectOption;

                        return (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                              showCorrect
                                ? 'bg-green-100 dark:bg-green-900/40 border-2 border-green-500'
                                : showWrong
                                ? 'bg-red-100 dark:bg-red-900/40 border-2 border-red-500'
                                : isSelected
                                ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-500'
                                : 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            } ${showResults ? 'cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="radio"
                              name={`question-${qIdx}`}
                              checked={isSelected}
                              onChange={() => {
                                if (!showResults) {
                                  const newAnswers = [...selectedAnswers];
                                  newAnswers[qIdx] = oIdx;
                                  setSelectedAnswers(newAnswers);
                                }
                              }}
                              disabled={showResults}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="flex-1 text-gray-900 dark:text-white">
                              {option}
                            </span>
                            {showCorrect && (
                              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">
                                ✓ Correto
                              </span>
                            )}
                            {showWrong && (
                              <span className="text-red-600 dark:text-red-400 font-semibold text-sm">
                                ✗ Errado
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {showResults && q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-900 dark:text-blue-300">
                          <span className="font-semibold">Explicação:</span> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Quiz Results */}
              {showResults && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Resultado
                  </h4>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {calculateQuizScore(selectedAnswers)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.content?.questions?.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length} de{' '}
                    {task.content?.questions?.length} corretas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reading (rich content) */}
          {!isEnriching && task.type === 'reading' && (
            <div className="space-y-6">
              {enrichedTask.content?.reading ? (
                <>
                  {/* Summary */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3 flex items-center gap-2">
                      <BookOpen size={16} />
                      Resumo do Conteúdo
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                      {enrichedTask.content.reading.summary}
                    </p>
                  </div>

                  {/* Key Points */}
                  {enrichedTask.content.reading.keyPoints && enrichedTask.content.reading.keyPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Pontos-Chave
                      </h4>
                      <ul className="space-y-2">
                        {enrichedTask.content.reading.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Sections */}
                  {enrichedTask.content.reading.sections && enrichedTask.content.reading.sections.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Seções do Artigo
                      </h4>
                      {enrichedTask.content.reading.sections.map((section, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                            {section.title}
                          </h5>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Full Article Link */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Ler artigo completo
                    </span>
                    <a
                      href={enrichedTask.content.reading.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Abrir Artigo <ExternalLink size={14} />
                    </a>
                  </div>

                  {/* Comprehension Questions */}
                  {enrichedTask.content.reading.comprehensionQuestions && enrichedTask.content.reading.comprehensionQuestions.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-3">
                        Questões de Compreensão
                      </h4>
                      <ul className="space-y-2">
                        {enrichedTask.content.reading.comprehensionQuestions.map((question, idx) => (
                          <li key={idx} className="text-sm text-green-900 dark:text-green-200">
                            {idx + 1}. {question.question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                // Fallback for basic reading task
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen size={32} className="text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Leitura Recomendada
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Acesse o recurso externo para completar esta tarefa
                      </p>
                    </div>
                  </div>
                  {task.content?.url && (
                    <a
                      href={task.content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Abrir Recurso <ExternalLink size={16} />
                    </a>
                  )}
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Após completar, clique em "Marcar como Completo" abaixo.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Video */}
          {task.type === 'video-watch' && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <Play size={32} className="text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Assistir Vídeo
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Acesse o vídeo para completar esta tarefa
                  </p>
                </div>
              </div>
              {task.content?.url && (
                <a
                  href={task.content.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Assistir Vídeo <ExternalLink size={16} />
                </a>
              )}
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Após completar, clique em "Marcar como Completo" abaixo.
              </p>
            </div>
          )}

          {/* Exercise (rich content) */}
          {!isEnriching && task.type === 'exercise' && (
            <div className="space-y-6">
              {/* Rich exercise content */}
              {enrichedTask.content?.exercise ? (
                <>
                  {/* Learning Resources */}
                  {enrichedTask.content.exercise.resources && enrichedTask.content.exercise.resources.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Recursos de Aprendizado
                      </h4>
                      <div className="space-y-3">
                        {enrichedTask.content.exercise.resources.map((resource, idx) => (
                          <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                          >
                            <div className="flex items-start gap-3">
                              {resource.type === 'video' && resource.thumbnailUrl && (
                                <img
                                  src={resource.thumbnailUrl}
                                  alt={resource.title}
                                  className="w-24 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                    {resource.type === 'article' && '📄 Artigo'}
                                    {resource.type === 'video' && '🎥 Vídeo'}
                                    {resource.type === 'documentation' && '📚 Documentação'}
                                    {resource.type === 'interactive' && '🎮 Interativo'}
                                  </span>
                                  {resource.language && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {resource.language === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {resource.estimatedMinutes} min
                                  </span>
                                </div>
                                <h5 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {resource.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {resource.description}
                                </p>
                              </div>
                              <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 flex-shrink-0" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {enrichedTask.content.exercise.objectives && enrichedTask.content.exercise.objectives.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Target size={16} />
                        Objetivos de Aprendizado
                      </h4>
                      <ul className="space-y-2">
                        {enrichedTask.content.exercise.objectives.map((objective, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Activities */}
                  {enrichedTask.content.exercise.practiceActivities && enrichedTask.content.exercise.practiceActivities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <ClipboardList size={16} />
                        Atividades Práticas
                      </h4>
                      <ul className="space-y-2">
                        {enrichedTask.content.exercise.practiceActivities.map((activity, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Self Assessment */}
                  {enrichedTask.content.exercise.selfAssessment && enrichedTask.content.exercise.selfAssessment.length > 0 && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-3">
                        Auto-Avaliação
                      </h4>
                      <p className="text-sm text-purple-800 dark:text-purple-300 mb-3">
                        Após estudar o conteúdo, reflita sobre as questões abaixo:
                      </p>
                      <ul className="space-y-2">
                        {enrichedTask.content.exercise.selfAssessment.map((question, idx) => (
                          <li key={idx} className="text-sm text-purple-900 dark:text-purple-200">
                            • {question.question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                // Fallback for exercises without rich content
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300">
                    Complete o exercício conforme descrito acima e clique em "Marcar como Completo" quando finalizar.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              showResults ||
              (task.type === 'quiz' && selectedAnswers.length !== task.content?.questions?.length)
            }
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              showResults ||
              (task.type === 'quiz' && selectedAnswers.length !== task.content?.questions?.length)
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            }`}
          >
            {task.type === 'coding-challenge'
              ? 'Submeter Código'
              : task.type === 'quiz'
              ? showResults
                ? 'Fechando...'
                : 'Submeter Respostas'
              : 'Marcar como Completo'}
          </button>
        </div>
      </div>
    </div>
  );
};
