import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, StickyNote, User, LogOut, Search, Heart } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { NotificationCenter } from './NotificationCenter';
import { ThemeToggle } from './ThemeToggle';
import { SearchModal } from './SearchModal';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useNotesStore } from '../store/useNotesStore';

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { favorites } = useFavoritesStore();
  const { getAllNotes } = useNotesStore();
  const notes = useMemo(() => getAllNotes(), [getAllNotes]);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">N</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white">
                  NeuroTrack
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Cursos</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat</span>
                </Link>
                <Link
                  to="/notes"
                  className="relative flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <StickyNote className="w-5 h-5" />
                  <span>Notas</span>
                  {notes.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full">
                      {notes.length}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSearch}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Buscar"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              <Link
                to="/favorites"
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Favoritos"
              >
                <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {favorites.length > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </Link>

              <NotificationCenter />

              <ThemeToggle />

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />

              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
