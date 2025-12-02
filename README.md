# NeuroTrack Frontend

A modern, adaptive learning platform with roadmap.sh-style visualization.

## Features

### Core Features (RF)
- **RF1-RF2**: Event tracking system for user interactions (play/pause, submissions, etc.)
- **RF3-RF4**: Adaptive learning paths with personalized recommendations
- **RF5**: Social interactions (comments, likes)
- **RF6**: Achievement system and gamification
- **RF7**: Quiz and exercise submissions
- **RF8**: Real-time progress tracking
- **RF9**: Authentication (OAuth-ready)

### New Features Added
- **Notification System**: Real-time notifications for achievements, recommendations, and milestones
- **Search Functionality**: Quick search for courses, lessons, and tags
- **Favorites System**: Bookmark and organize favorite courses and lessons
- **Dark Mode**: Full dark/light theme support with system preference detection
- **Notes Panel**: Take and manage notes for each lesson
- **Enhanced Navigation**: Modern navbar with quick access to all features

### Non-Functional Requirements (RNF)
- **RNF1**: Multi-user support
- **RNF2**: Event persistence with retry mechanism
- **RNF3**: API documentation ready (Swagger-compatible)
- **RNF4**: Responsive design (desktop + mobile)
- **RNF5**: Low-latency event tracking

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Navigation
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/           # React components
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # Main dashboard
│   ├── Navbar.tsx       # Enhanced navigation bar
│   ├── NotificationCenter.tsx  # Notification system
│   ├── SearchModal.tsx  # Global search
│   ├── ThemeToggle.tsx  # Dark/light mode toggle
│   ├── NotesPanel.tsx   # Lesson notes interface
│   ├── FavoritesScreen.tsx  # Favorites page
│   ├── RoadmapGraph.tsx # Clean graph visualization
│   └── UnifiedLearningGraph.tsx  # Unified learning roadmap
├── store/               # Zustand stores
│   ├── useAuthStore.ts  # Authentication state
│   ├── useLearningStore.ts  # Learning progress state
│   ├── useNotificationStore.ts  # Notifications
│   ├── useThemeStore.ts # Theme preferences
│   ├── useNotesStore.ts # User notes
│   └── useFavoritesStore.ts  # Favorites
├── types/               # TypeScript types
│   └── index.ts         # Core type definitions
├── data/                # Mock data
│   └── mockData.ts      # Sample courses and achievements
├── utils/               # Utilities
│   └── eventTracker.ts  # Event tracking system (RF1, RF2)
├── App.tsx              # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## Key Components

### UnifiedLearningGraph
The main learning visualization that combines all courses into a single, interactive roadmap. Features:
- Clean, roadmap.sh-inspired design
- Multi-course visualization
- Course filtering
- Interactive nodes with detailed panels
- Progress tracking

### RoadmapGraph
SVG-based graph rendering with:
- Clean node design
- Status indicators (locked, available, in-progress, completed)
- Difficulty badges
- Progress bars
- Prerequisites visualization
- Smooth animations

### Dashboard
User dashboard with:
- Progress statistics
- Course overview
- Recent activity feed
- Achievement tracking

## Event Tracking

The platform automatically tracks:
- Content access
- Video play/pause
- Exercise submissions
- Quiz answers
- Social interactions (likes, comments)

Events are queued and retried on failure (RNF2).

## Customization

### Adding New Courses

Edit `src/data/mockData.ts` to add new courses and learning nodes.

### Modifying Graph Layout

Adjust node positions in the course data or implement auto-layout algorithms in `UnifiedLearningGraph.tsx`.

### Styling

The project uses Tailwind CSS. Customize colors in `tailwind.config.js`.

## API Integration

The frontend is ready to connect to a backend API. Update the API endpoints in:
- `src/store/useAuthStore.ts` - Authentication
- `src/store/useLearningStore.ts` - Learning data
- `src/utils/eventTracker.ts` - Event tracking

## License

MIT

## Author

Eduardo Ferraz
