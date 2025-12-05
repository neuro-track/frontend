import { youtubeService, YouTubeVideo } from './youtubeService';
import { wikipediaService, WikipediaArticle } from './wikipediaService';
import { ExerciseContent, ReadingContent, LearningResource, QuizQuestion } from '../types';

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

  /**
   * Generate rich exercise content with multiple resources
   */
  async generateExerciseContent(topic: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<ExerciseContent> {
    try {
      const language = 'pt';
      wikipediaService.setLanguage(language);

      // Search for educational resources in parallel
      const [videos, wikipediaResults] = await Promise.all([
        youtubeService.searchVideos({
          query: `${topic} tutorial ${language === 'pt' ? 'português' : ''}`,
          maxResults: 3,
          order: 'relevance',
          language,
        }),
        wikipediaService.search(topic, 2),
      ]);

      // Build resources array
      const resources: LearningResource[] = [];

      // Add Wikipedia articles as resources
      for (const wikiResult of wikipediaResults.slice(0, 2)) {
        resources.push({
          type: 'article',
          title: wikiResult.title,
          url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(wikiResult.title)}`,
          description: wikiResult.snippet || `Artigo sobre ${topic}`,
          estimatedMinutes: 10,
          language: 'pt',
        });
      }

      // Add YouTube videos as resources
      for (const video of videos.slice(0, 2)) {
        // Parse duration string like "PT15M30S" to minutes
        const durationMatch = video.duration.match(/PT(\d+)M/);
        const durationMinutes = durationMatch ? parseInt(durationMatch[1]) : 10;

        resources.push({
          type: 'video',
          title: video.title,
          url: `https://www.youtube.com/watch?v=${video.id}`,
          description: video.description,
          estimatedMinutes: durationMinutes,
          language: video.channelTitle.toLowerCase().includes('portugu') ? 'pt' : 'en',
          thumbnailUrl: video.thumbnailUrl,
        });
      }

      // Add MDN documentation if relevant for web topics
      const webTopics = ['javascript', 'html', 'css', 'react', 'node', 'typescript', 'api', 'dom', 'fetch'];
      if (webTopics.some(t => topic.toLowerCase().includes(t))) {
        const mdnTopic = topic.toLowerCase().replace(/\s+/g, '_');
        resources.push({
          type: 'documentation',
          title: `Documentação MDN: ${topic}`,
          url: `https://developer.mozilla.org/pt-BR/docs/Web/${mdnTopic}`,
          description: 'Documentação oficial da Mozilla Developer Network',
          estimatedMinutes: 15,
          language: 'pt',
        });
      }

      // Generate learning objectives based on difficulty
      const objectives = this.generateObjectives(topic, difficulty);

      // Generate practice activities
      const practiceActivities = this.generatePracticeActivities(topic, difficulty);

      // Generate self-assessment questions (optional)
      const selfAssessment = this.generateSelfAssessment(topic, difficulty);

      return {
        resources,
        objectives,
        practiceActivities,
        selfAssessment: selfAssessment.length > 0 ? selfAssessment : undefined,
      };
    } catch (error) {
      console.error('Error generating exercise content:', error);

      // Return minimal content on error
      return {
        resources: [{
          type: 'documentation',
          title: `Aprenda sobre ${topic}`,
          url: 'https://developer.mozilla.org/pt-BR/',
          description: `Recursos sobre ${topic}`,
          estimatedMinutes: 20,
          language: 'pt',
        }],
        objectives: [`Entender os conceitos básicos de ${topic}`],
        practiceActivities: [`Pesquisar e ler sobre ${topic}`],
      };
    }
  }

  /**
   * Generate rich reading material with embedded Wikipedia content
   */
  async generateReadingMaterial(topic: string): Promise<ReadingContent> {
    try {
      wikipediaService.setLanguage('pt');

      const article = await wikipediaService.getArticle(topic);

      if (!article) {
        throw new Error('Article not found');
      }

      // Extract key points from first paragraphs
      const paragraphs = article.extract.split('\n').filter(p => p.trim().length > 50);
      const keyPoints = paragraphs.slice(0, 3).map(p => p.substring(0, 150) + '...');

      // Create sections from paragraphs
      const sections = paragraphs.slice(0, 5).map((p, index) => ({
        title: `Seção ${index + 1}`,
        content: p,
      }));

      return {
        url: article.fullUrl,
        summary: article.extract.substring(0, 500) + '...',
        keyPoints,
        sections,
        comprehensionQuestions: this.generateComprehensionQuestions(topic),
      };
    } catch (error) {
      console.error('Error generating reading material:', error);

      // Fallback to basic content
      return {
        url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(topic)}`,
        summary: `Conteúdo educacional sobre ${topic}. Visite o link para ler o artigo completo.`,
        keyPoints: [
          `${topic} é um conceito importante no desenvolvimento`,
          `Compreender ${topic} ajuda no aprendizado de tecnologias relacionadas`,
          `Pratique com exemplos para dominar ${topic}`,
        ],
      };
    }
  }

  // Helper methods
  private generateObjectives(topic: string, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const baseObjectives = [
      `Compreender os conceitos fundamentais de ${topic}`,
      `Identificar aplicações práticas de ${topic}`,
    ];

    if (difficulty === 'medium' || difficulty === 'hard') {
      baseObjectives.push(`Implementar soluções usando ${topic}`);
    }

    if (difficulty === 'hard') {
      baseObjectives.push(`Otimizar e depurar código relacionado a ${topic}`);
      baseObjectives.push(`Explicar ${topic} para outros desenvolvedores`);
    }

    return baseObjectives;
  }

  private generatePracticeActivities(topic: string, difficulty: 'easy' | 'medium' | 'hard'): string[] {
    const activities = [
      `Leia os artigos e assista aos vídeos sobre ${topic}`,
      `Anote os conceitos principais enquanto estuda`,
    ];

    if (difficulty === 'medium' || difficulty === 'hard') {
      activities.push(`Crie um exemplo simples usando ${topic}`);
      activities.push(`Teste seu código e valide o comportamento`);
    }

    if (difficulty === 'hard') {
      activities.push(`Refatore o código aplicando boas práticas`);
      activities.push(`Documente sua implementação`);
    }

    return activities;
  }

  private generateSelfAssessment(topic: string, _difficulty: 'easy' | 'medium' | 'hard'): QuizQuestion[] {
    // Generate 2-3 simple self-assessment questions
    return [
      {
        id: `${topic}-q1`,
        question: `Qual é o propósito principal de ${topic}?`,
        options: [
          'Opção correta (você descobrirá estudando)',
          'Outra opção',
          'Mais uma opção',
          'Última opção',
        ],
        correctAnswer: 0,
        explanation: `Revise o material sobre ${topic} para entender seu propósito.`,
      },
    ];
  }

  private generateComprehensionQuestions(topic: string): QuizQuestion[] {
    return [
      {
        id: `${topic}-comprehension-1`,
        question: `Após ler sobre ${topic}, você consegue explicar o conceito com suas próprias palavras?`,
        options: [
          'Sim, compreendi completamente',
          'Parcialmente, preciso revisar',
          'Não, preciso estudar mais',
        ],
        correctAnswer: 0,
        explanation: 'Auto-avaliação de compreensão',
      },
    ];
  }
}

export const contentGeneratorService = new ContentGeneratorService();
