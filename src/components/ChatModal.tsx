import { X, MessageSquare } from 'lucide-react';
import { useEffect } from 'react';
import { ChatScreenContent } from './ChatScreenContent';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ChatModal - Modal/Drawer component for global chat
 *
 * Displays chat in a side drawer that slides in from the right.
 * Features:
 * - Backdrop with blur effect
 * - Escape key to close
 * - Click outside to close
 * - Prevents body scroll when open
 * - Responsive: fullscreen on mobile, drawer on desktop
 */
export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Drawer (slide from right) */}
      <div className="fixed right-0 top-0 bottom-0 w-full md:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center gap-3">
            <MessageSquare size={24} className="text-white" />
            <div>
              <h2 className="text-lg font-bold text-white">AI Assistant</h2>
              <p className="text-sm text-blue-100">Always here to help</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close chat"
          >
            <X size={20} />
          </button>
        </div>

        {/* Chat Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto">
          <ChatScreenContent isModal={true} onClose={onClose} />
        </div>
      </div>
    </>
  );
};
