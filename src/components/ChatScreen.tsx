import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { PageContainer } from './PageContainer';
import { PageHeader } from './PageHeader';
import { Card } from './Card';

export const ChatScreen = () => {
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

  return (
    <PageContainer maxWidth="2xl">
      <div className="space-y-6">
        <PageHeader
          title="AI Assistant"
          description="Your personalized learning companion"
          backTo={{ label: 'Voltar ao Dashboard', path: '/dashboard' }}
        />

        {/* Chat Container */}
        <Card padding="lg" className="flex flex-col min-h-[600px]">
          {/* AI Status */}
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

          {/* Messages */}
          <div className="flex-1 mb-6 space-y-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
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
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Quick suggestions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-left text-sm text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all"
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
              className="w-full pl-6 pr-14 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} />
            </button>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};
