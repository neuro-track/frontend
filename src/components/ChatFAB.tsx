import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChatModal } from './ChatModal';

/**
 * ChatFAB - Floating Action Button for global chat access
 *
 * Displays a floating button in the bottom-right corner that opens the chat modal.
 * Hidden on the /chat page itself (to avoid redundancy).
 */
export const ChatFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Don't show FAB on chat page
  if (location.pathname === '/chat') {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-40 group"
        aria-label="Open AI Chat"
      >
        <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
