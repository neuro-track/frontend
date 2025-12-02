import { useState, useEffect } from 'react';
import { Play, Clock } from 'lucide-react';
import { YouTubeVideo } from '../services/youtubeService';
import { eventTracker } from '../utils/eventTracker';
import { useAuthStore } from '../store/useAuthStore';

interface VideoPlayerProps {
  video: YouTubeVideo;
  nodeId?: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ video, nodeId, autoPlay = false }: VideoPlayerProps) {
  const { user } = useAuthStore();
  const embedUrl = `https://www.youtube.com/embed/${video.id}?enablejsapi=1${autoPlay ? '&autoplay=1' : ''}`;

  useEffect(() => {
    if (user && nodeId) {
      eventTracker.trackAccess(user.id, video.id, 'video');
    }
  }, [video.id, user, nodeId]);

  const formatViewCount = (count: string): string => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Video Embed */}
      <div className="relative aspect-video bg-black">
        <iframe
          src={embedUrl}
          title={video.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {video.title}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {video.duration}
          </span>
          <span>{formatViewCount(video.viewCount)} visualizações</span>
          <span>{video.channelTitle}</span>
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
          {video.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <Play className="w-4 h-4" />
            Assistir no YouTube
          </a>
        </div>
      </div>
    </div>
  );
}

// Componente simplificado de lista de vídeos
export function VideoList({ videos, nodeId }: { videos: YouTubeVideo[]; nodeId?: string }) {
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(
    videos.length > 0 ? videos[0] : null
  );

  if (videos.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
        <Play className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum vídeo disponível para esta lição
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Player Principal */}
      {selectedVideo && <VideoPlayer video={selectedVideo} nodeId={nodeId} />}

      {/* Lista de Vídeos Relacionados */}
      {videos.length > 1 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Vídeos Relacionados
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {videos
              .filter((v) => v.id !== selectedVideo?.id)
              .map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className="flex gap-3 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {video.title}
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {video.channelTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {video.duration}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
