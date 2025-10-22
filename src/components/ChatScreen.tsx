import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Bell, MessageSquare, Send } from 'lucide-react';

export const ChatScreen = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<
    Array<{ id: number; role: 'user' | 'assistant'; content: string }>
  >([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hello! I'm your AI learning assistant.\n\nTell me what you'd like to learn and I'll create a personalized learning path for you. It can be any area: technology, design, business, languages, or any specific skill!",
    },
  ]);

  const quickSuggestions = [
    'Learn React from scratch',
    'Modern interface design',
    'Python for data analysis',
    'Digital marketing for beginners',
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: { id: number; role: 'user' | 'assistant'; content: string } = {
      id: messages.length + 1,
      role: 'user',
      content: message,
    };

    const aiResponse: { id: number; role: 'user' | 'assistant'; content: string } = {
      id: messages.length + 2,
      role: 'assistant',
      content: `Great choice! I'll help you create a personalized learning path for "${message}". Let me analyze the best resources and create a structured roadmap for you.`,
    };

    setMessages([...messages, userMessage, aiResponse]);
    setMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
  };

  const currentLevel = 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Neuro Track</h1>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Dashboard
                </span>
              </button>
              <button
                onClick={() => navigate('/chat')}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-gray-100 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  AI Chat
                </span>
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} />
                  Courses
                </span>
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 hover:bg-gray-100 rounded-lg p-1.5 pr-3 transition-colors"
              >
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">Level {currentLevel}</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col">
        {/* AI Assistant Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Assistant</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 mb-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-3 max-w-2xl">
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-6 py-4 ${
                    msg.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Suggestions */}
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Quick suggestions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-left text-sm text-gray-700 hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What would you like to learn?"
            className="w-full pl-6 pr-14 py-4 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
