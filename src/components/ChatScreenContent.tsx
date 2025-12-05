import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfileStore } from '../store/useUserProfileStore';
import { useLearningStore } from '../store/useLearningStore';
import { aiService } from '../services/aiService';
import { generateRoadmapFromChat } from '../utils/roadmapGenerator';

interface ChatScreenContentProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const ChatScreenContent = ({ isModal = false, onClose }: ChatScreenContentProps) => {
  const navigate = useNavigate();
  const { profile, addChatMessage } = useUserProfileStore();
  const { conversationHistory } = profile;
  const { roadmap } = useLearningStore();

  const [message, setMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [interviewStep, setInterviewStep] = useState(0);
  const [isInterviewMode, setIsInterviewMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Detect if user is brand new (no conversation history and no roadmap)
  const isNewUser = conversationHistory.length === 0 && !roadmap;

  // Interview questions
  const interviewQuestions = [
    {
      question: "Qual é seu principal objetivo de aprendizado?",
      examples: ["Me tornar desenvolvedor full stack", "Aprender ciência de dados", "Dominar design de interfaces"],
      key: "goal"
    },
    {
      question: "Qual cargo ou papel você almeja?",
      examples: ["Desenvolvedor Full Stack", "Data Scientist", "UX/UI Designer"],
      key: "role"
    },
    {
      question: "Qual seu nível de experiência atual na área?",
      examples: ["Iniciante - nunca programei", "Intermediário - já fiz alguns projetos", "Avançado - trabalho na área"],
      key: "level"
    },
    {
      question: "Quais tecnologias ou habilidades você quer aprender especificamente?",
      examples: ["React, TypeScript, Node.js", "Python, pandas, machine learning", "Figma, design systems, acessibilidade"],
      key: "technologies"
    },
    {
      question: "Quantas horas por semana você pode dedicar aos estudos?",
      examples: ["5-10 horas", "10-20 horas", "20+ horas"],
      key: "hours"
    },
    {
      question: "O que você já sabe ou já estudou relacionado a isso?",
      examples: ["HTML e CSS básico", "Python básico", "Nunca estudei nada relacionado"],
      key: "background"
    }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, streamingMessage]);

  // Initialize with welcome message if empty
  useEffect(() => {
    if (conversationHistory.length === 0) {
      addChatMessage({
        role: 'assistant',
        content:
          "Olá! Sou seu assistente de aprendizado com IA.\n\nVou criar um roadmap personalizado para você! Posso fazer de duas formas:\n\n**Opção 1: Entrevista Guiada** - Faço 6 perguntas rápidas para entender seus objetivos\n**Opção 2: Conversa Livre** - Você me conta tudo livremente e conversamos\n\nQual você prefere?",
      });
    }
  }, []);

  // Handle interview flow
  const startInterview = () => {
    setIsInterviewMode(true);
    setInterviewStep(0);

    addChatMessage({
      role: 'assistant',
      content: `Ótimo! Vou fazer ${interviewQuestions.length} perguntas para criar seu roadmap personalizado.\n\n**Pergunta 1/${interviewQuestions.length}:**\n${interviewQuestions[0].question}\n\nExemplos:\n${interviewQuestions[0].examples.map(ex => `• ${ex}`).join('\n')}`,
    });
  };

  const handleInterviewAnswer = (_userAnswer: string) => {
    const nextStep = interviewStep + 1;

    if (nextStep < interviewQuestions.length) {
      // More questions
      setInterviewStep(nextStep);

      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: `Perfeito!\n\n**Pergunta ${nextStep + 1}/${interviewQuestions.length}:**\n${interviewQuestions[nextStep].question}\n\nExemplos:\n${interviewQuestions[nextStep].examples.map(ex => `• ${ex}`).join('\n')}`,
        });
      }, 500);
    } else {
      // Interview complete
      setIsInterviewMode(false);

      setTimeout(() => {
        addChatMessage({
          role: 'assistant',
          content: `Excelente!\n\nColetei todas as informações necessárias. Agora posso gerar um roadmap completamente personalizado para você com:\n\n• Lições adaptadas ao seu nível\n• Tecnologias que você quer aprender\n• Ritmo baseado no seu tempo disponível\n• Exercícios práticos em cada etapa\n\nClique no botão abaixo para gerar seu roadmap.`,
        });
      }, 500);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    const userMessageContent = message;
    setMessage('');

    // Add user message
    addChatMessage({
      role: 'user',
      content: userMessageContent,
    });

    // Check if user is choosing interview mode
    if (conversationHistory.length === 1 && !isInterviewMode) {
      const lowerMessage = userMessageContent.toLowerCase();

      if (lowerMessage.includes('entrevista') || lowerMessage.includes('guiada') || lowerMessage.includes('1')) {
        startInterview();
        return;
      } else if (lowerMessage.includes('livre') || lowerMessage.includes('conversa') || lowerMessage.includes('2')) {
        addChatMessage({
          role: 'assistant',
          content: 'Perfeito! Pode me contar livremente sobre seus objetivos de aprendizado. Quanto mais detalhes você der, melhor será o roadmap personalizado.',
        });
        return;
      }
    }

    // If in interview mode, handle as interview answer
    if (isInterviewMode) {
      handleInterviewAnswer(userMessageContent);
      return;
    }

    // Otherwise, stream AI response (free conversation mode)
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const fullResponse = await aiService.streamChatResponse(
        [
          ...conversationHistory,
          { role: 'user', content: userMessageContent },
        ],
        (chunk) => {
          setStreamingMessage((prev) => prev + chunk);
        }
      );

      // Save complete response
      addChatMessage({
        role: 'assistant',
        content: fullResponse,
      });

      setStreamingMessage('');
    } catch (error) {
      console.error('Error streaming response:', error);
      addChatMessage({
        role: 'assistant',
        content:
          'Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se a API key está configurada corretamente no arquivo .env',
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    const result = await generateRoadmapFromChat();

    setIsGenerating(false);

    if (result.success) {
      if (isModal && onClose) {
        onClose(); // Fecha modal se estiver em modal
      }
      // Redireciona para /learn para ver o roadmap gerado
      navigate('/learn');
    } else {
      setGenerationError(result.error || 'Erro desconhecido');
    }
  };

  return (
    <div className={`flex flex-col ${isModal ? 'h-full p-6' : 'min-h-[600px]'}`}>
      {/* AI Status */}
      {!isModal && (
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className={`flex-1 mb-6 space-y-4 overflow-y-auto ${isModal ? 'max-h-[calc(100vh-280px)]' : 'max-h-[500px]'}`}>
        {conversationHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-start gap-3 max-w-2xl">
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={16} className="text-white" />
                </div>
              )}
              <div
                className={`rounded-2xl px-6 py-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {msg.content}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && streamingMessage && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-white" />
              </div>
              <div className="rounded-2xl px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <p className="text-sm leading-relaxed whitespace-pre-line">
                  {streamingMessage}
                  <span className="inline-block w-1 h-4 bg-blue-600 animate-pulse ml-1"></span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isStreaming && !streamingMessage && (
          <div className="flex justify-start">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageSquare size={16} className="text-white" />
              </div>
              <div className="rounded-2xl px-6 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Loader size={16} className="animate-spin text-blue-600" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Generate Roadmap Button */}
      {conversationHistory.length >= 8 && !isGenerating && !isInterviewMode && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Pronto para gerar seu roadmap personalizado?
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Baseado na nossa conversa, vou criar um caminho de aprendizado sob medida para você com lições e exercícios práticos.
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateRoadmap}
            disabled={isStreaming}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            Gerar Roadmap Personalizado
          </button>

          {generationError && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {generationError}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Generation in Progress */}
      {isGenerating && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="flex flex-col items-center gap-4">
            <Loader size={40} className="animate-spin text-blue-600" />
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Gerando seu roadmap personalizado...
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Analisando seus objetivos e criando um caminho de aprendizado completo com lições e exercícios. Isso pode levar alguns instantes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Message for New Users */}
      {isNewUser && (
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Bem-vindo ao NeuroTrack
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            Vou criar um plano de estudos completamente personalizado para você.
            Podemos fazer de duas formas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Entrevista Guiada</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                6 perguntas rápidas e objetivas
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Conversa Livre</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Converse naturalmente sobre seus objetivos
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection Buttons */}
      {conversationHistory.length === 1 && !isStreaming && !isInterviewMode && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Escolha como prefere continuar:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={startInterview}
              className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-lg text-left hover:border-blue-400 dark:hover:border-blue-600 transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Entrevista Guiada</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Responda 6 perguntas rápidas e diretas
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Recomendado - Mais rápido e objetivo
              </p>
            </button>

            <button
              onClick={() => {
                addChatMessage({
                  role: 'user',
                  content: '2',
                });
                addChatMessage({
                  role: 'assistant',
                  content: 'Perfeito! Pode me contar livremente sobre seus objetivos de aprendizado. Quanto mais detalhes você der, melhor será o roadmap personalizado.',
                });
              }}
              className="p-6 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-left hover:border-gray-300 dark:hover:border-gray-600 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">Conversa Livre</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Converse naturalmente comigo sobre seus objetivos
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Ideal para explorar ideias
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="relative">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="O que você gostaria de aprender?"
          disabled={isStreaming || isGenerating}
          className="w-full pl-6 pr-14 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!message.trim() || isStreaming || isGenerating}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isStreaming ? (
            <Loader size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  );
};
