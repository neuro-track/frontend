import { youtubeService, YouTubeVideo } from './youtubeService';
import { wikipediaService, WikipediaArticle } from './wikipediaService';

export interface LessonContent {
  title: string;
  description: string;
  videos: YouTubeVideo[];
  article: WikipediaArticle | null;
  relatedTopics: string[];
  estimatedReadingTime: number; // em minutos
}

class ContentGeneratorService {
  async generateLessonContent(topic: string, options?: {
    maxVideos?: number;
    videoDuration?: 'short' | 'medium' | 'long';
    language?: 'en' | 'pt';
  }): Promise<LessonContent> {
    const maxVideos = options?.maxVideos || 3;
    const language = options?.language || 'pt';

    // Configurar idioma da Wikipedia
    wikipediaService.setLanguage(language);

    try {
      // Buscar vídeos e artigo em paralelo
      const [videos, article] = await Promise.all([
        youtubeService.searchVideos({
          query: `${topic} tutorial ${language === 'pt' ? 'português' : 'english'}`,
          maxResults: maxVideos,
          order: 'relevance',
          videoDuration: options?.videoDuration,
          language: language,
        }),
        wikipediaService.getArticle(topic),
      ]);

      // Garantir que sempre temos um artigo (fallback já está no service)
      const finalArticle = article || {
        title: topic,
        extract: `Conteúdo sobre ${topic}. Assista os vídeos disponíveis para aprender mais.`,
        fullUrl: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(topic)}`,
        categories: [],
      };

      // Buscar tópicos relacionados
      const relatedTopics = finalArticle
        ? await wikipediaService.getRelatedTopics(finalArticle.title, 5).catch(() => [])
        : [];

      // Calcular tempo estimado de leitura (baseado no conteúdo do artigo)
      const wordCount = finalArticle.extract.split(' ').length || 0;
      const estimatedReadingTime = Math.ceil(wordCount / 200); // 200 palavras por minuto

      return {
        title: topic,
        description: finalArticle.extract.substring(0, 300) + '...' || `Aprenda sobre ${topic}`,
        videos,
        article: finalArticle,
        relatedTopics,
        estimatedReadingTime: Math.max(1, estimatedReadingTime),
      };
    } catch (error) {
      console.error('Error generating lesson content:', error);

      // Retornar conteúdo mínimo em caso de erro
      return {
        title: topic,
        description: `Aprenda sobre ${topic}`,
        videos: [],
        article: {
          title: topic,
          extract: `Erro ao carregar conteúdo sobre ${topic}. Por favor, tente novamente mais tarde.`,
          fullUrl: `https://pt.wikipedia.org/wiki/${encodeURIComponent(topic)}`,
        },
        relatedTopics: [],
        estimatedReadingTime: 1,
      };
    }
  }

  async searchContent(query: string): Promise<{
    videos: YouTubeVideo[];
    articles: any[];
  }> {
    try {
      const [videos, wikipediaResults] = await Promise.all([
        youtubeService.searchVideos({
          query: query + ' tutorial',
          maxResults: 5,
          order: 'relevance',
        }),
        wikipediaService.search(query, 5),
      ]);

      return {
        videos,
        articles: wikipediaResults,
      };
    } catch (error) {
      console.error('Error searching content:', error);
      return {
        videos: [],
        articles: [],
      };
    }
  }

  async getVideoAndSummary(videoId: string, topic: string): Promise<{
    video: YouTubeVideo | null;
    summary: string;
  }> {
    try {
      const [video, summary] = await Promise.all([
        youtubeService.getVideoById(videoId),
        wikipediaService.getSummary(topic),
      ]);

      return { video, summary };
    } catch (error) {
      console.error('Error fetching video and summary:', error);
      return {
        video: null,
        summary: 'Resumo não disponível.',
      };
    }
  }

  async enrichCourseNode(nodeTitle: string): Promise<LessonContent> {
    return this.generateLessonContent(nodeTitle, {
      maxVideos: 2,
      videoDuration: 'medium',
      language: 'pt',
    });
  }
}

export const contentGeneratorService = new ContentGeneratorService();
