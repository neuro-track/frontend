// YouTube API Service
// Para usar a API do YouTube, você precisará criar uma API key em:
// https://console.cloud.google.com/apis/credentials

const YOUTUBE_API_KEY = (import.meta as any).env?.VITE_YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
}

export interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
  videoDuration?: 'short' | 'medium' | 'long';
  language?: string;
}

class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchVideos(params: YouTubeSearchParams): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured. Using mock data.');
      return this.getMockVideos(params.query);
    }

    try {
      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: params.query,
        maxResults: (params.maxResults || 5).toString(),
        order: params.order || 'relevance',
        type: 'video',
        key: this.apiKey,
        videoEmbeddable: 'true',
        ...(params.videoDuration && { videoDuration: params.videoDuration }),
        ...(params.language && { relevanceLanguage: params.language }),
      });

      const searchResponse = await fetch(
        `${YOUTUBE_API_BASE_URL}/search?${searchParams}`
      );

      if (!searchResponse.ok) {
        throw new Error('YouTube API search failed');
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Get video details
      const detailsParams = new URLSearchParams({
        part: 'snippet,contentDetails,statistics',
        id: videoIds,
        key: this.apiKey,
      });

      const detailsResponse = await fetch(
        `${YOUTUBE_API_BASE_URL}/videos?${detailsParams}`
      );

      if (!detailsResponse.ok) {
        throw new Error('YouTube API details failed');
      }

      const detailsData = await detailsResponse.json();

      return detailsData.items.map((item: any) => ({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
      }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return this.getMockVideos(params.query);
    }
  }

  async getVideoById(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      console.warn('YouTube API key not configured.');
      return null;
    }

    try {
      const params = new URLSearchParams({
        part: 'snippet,contentDetails,statistics',
        id: videoId,
        key: this.apiKey,
      });

      const response = await fetch(`${YOUTUBE_API_BASE_URL}/videos?${params}`);

      if (!response.ok) {
        throw new Error('YouTube API failed');
      }

      const data = await response.json();

      if (data.items.length === 0) {
        return null;
      }

      const item = data.items[0];

      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        channelTitle: item.snippet.channelTitle,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: item.statistics.viewCount,
        publishedAt: item.snippet.publishedAt,
      };
    } catch (error) {
      console.error('Error fetching YouTube video:', error);
      return null;
    }
  }

  private parseDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  }

  private getMockVideos(query: string): YouTubeVideo[] {
    return [
      {
        id: 'dQw4w9WgXcQ',
        title: `${query} - Tutorial Completo`,
        description: `Aprenda tudo sobre ${query} neste tutorial completo para iniciantes.`,
        thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        channelTitle: 'Coding Academy',
        duration: '15:30',
        viewCount: '1234567',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'jNQXAC9IVRw',
        title: `${query} em 10 Minutos`,
        description: `Um guia rápido para começar com ${query}.`,
        thumbnailUrl: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
        channelTitle: 'Tech Tutorials',
        duration: '10:45',
        viewCount: '987654',
        publishedAt: new Date().toISOString(),
      },
    ];
  }

  getEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }
}

export const youtubeService = new YouTubeService(YOUTUBE_API_KEY);
