import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';

// Lazy-loaded components for code splitting
const Auth = lazy(() => import('./components/Auth').then(m => ({ default: m.Auth })));
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const UnifiedLearningGraph = lazy(() => import('./components/UnifiedLearningGraph').then(m => ({ default: m.UnifiedLearningGraph })));
const CourseScreen = lazy(() => import('./components/CourseScreen').then(m => ({ default: m.CourseScreen })));
const LessonScreenEnhanced = lazy(() => import('./components/LessonScreenEnhanced').then(m => ({ default: m.LessonScreenEnhanced })));
const ProfilePage = lazy(() => import('./components/ProfilePage').then(m => ({ default: m.ProfilePage })));
const ChatScreen = lazy(() => import('./components/ChatScreen').then(m => ({ default: m.ChatScreen })));
const CoursesScreen = lazy(() => import('./components/CoursesScreen').then(m => ({ default: m.CoursesScreen })));
const FavoritesScreen = lazy(() => import('./components/FavoritesScreen').then(m => ({ default: m.FavoritesScreen })));
const NotesPage = lazy(() => import('./components/NotesPage').then(m => ({ default: m.NotesPage })));
const ChatFAB = lazy(() => import('./components/ChatFAB').then(m => ({ default: m.ChatFAB })));
const SupabaseTest = lazy(() => import('./components/SupabaseTest').then(m => ({ default: m.SupabaseTest })));

// Loading fallback component
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
      </div>
    </div>
  );
}

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Auth />}
          />
          <Route
            path="/dashboard"
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/chat"
            element={isAuthenticated ? <ChatScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/courses"
            element={isAuthenticated ? <CoursesScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/learn"
            element={isAuthenticated ? <UnifiedLearningGraph /> : <Navigate to="/" />}
          />
          <Route
            path="/course/:courseId"
            element={isAuthenticated ? <CourseScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/lesson/:courseId/:nodeId"
            element={isAuthenticated ? <LessonScreenEnhanced /> : <Navigate to="/" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />}
          />
          <Route
            path="/favorites"
            element={isAuthenticated ? <FavoritesScreen /> : <Navigate to="/" />}
          />
          <Route
            path="/notes"
            element={isAuthenticated ? <NotesPage /> : <Navigate to="/" />}
          />
          <Route
            path="/supabase-test"
            element={<SupabaseTest />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Chat FAB - visible on all authenticated pages */}
        {isAuthenticated && <ChatFAB />}
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
