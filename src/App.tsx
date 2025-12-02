import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { UnifiedLearningGraph } from './components/UnifiedLearningGraph';
import { CourseScreen } from './components/CourseScreen';
import { LessonScreen } from './components/LessonScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ChatScreen } from './components/ChatScreen';
import { CoursesScreen } from './components/CoursesScreen';
import { FavoritesScreen } from './components/FavoritesScreen';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
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
          element={isAuthenticated ? <LessonScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfileScreen /> : <Navigate to="/" />}
        />
        <Route
          path="/favorites"
          element={isAuthenticated ? <FavoritesScreen /> : <Navigate to="/" />}
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
