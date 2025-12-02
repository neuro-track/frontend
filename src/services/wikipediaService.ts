// Wikipedia API Service
// Usa a API pública da Wikipedia (sem necessidade de API key)

const WIKIPEDIA_API_BASE_URL = 'https://en.wikipedia.org/w/api.php';
const WIKIPEDIA_PT_API_BASE_URL = 'https://pt.wikipedia.org/w/api.php';

export interface WikipediaArticle {
  title: string;
  extract: string;
  fullUrl: string;
  thumbnail?: string;
  categories?: string[];
}

export interface WikipediaSearchResult {
  title: string;
  snippet: string;
  pageid: number;
}

class WikipediaService {
  private language: 'en' | 'pt';

  constructor(language: 'en' | 'pt' = 'pt') {
    this.language = language;
  }

  private getApiUrl(): string {
    return this.language === 'pt' ? WIKIPEDIA_PT_API_BASE_URL : WIKIPEDIA_API_BASE_URL;
  }

  async search(query: string, limit: number = 5): Promise<WikipediaSearchResult[]> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        format: 'json',
        origin: '*',
        srlimit: limit.toString(),
      });

      const response = await fetch(`${this.getApiUrl()}?${params}`);
      const data = await response.json();

      return data.query.search.map((item: any) => ({
        title: item.title,
        snippet: this.stripHtml(item.snippet),
        pageid: item.pageid,
      }));
    } catch (error) {
      console.error('Error searching Wikipedia:', error);
      return [];
    }
  }

  async getArticle(title: string): Promise<WikipediaArticle | null> {
    try {
      // Primeiro, fazer uma busca para encontrar o artigo mais relevante
      const searchResults = await this.search(title, 1);

      if (searchResults.length === 0) {
        console.log(`No Wikipedia article found for: ${title}`);
        return this.createFallbackArticle(title);
      }

      const bestMatch = searchResults[0];

      const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts|pageimages|categories|info',
        exintro: 'true',
        explaintext: 'true',
        pageids: bestMatch.pageid.toString(),
        format: 'json',
        origin: '*',
        pithumbsize: '500',
        inprop: 'url',
      });

      const response = await fetch(`${this.getApiUrl()}?${params}`);

      if (!response.ok) {
        throw new Error(`Wikipedia API returned ${response.status}`);
      }

      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1' || !pages[pageId]) {
        console.log(`Article not found for pageId: ${pageId}`);
        return this.createFallbackArticle(title);
      }

      const page = pages[pageId];

      if (!page.extract || page.extract.trim().length === 0) {
        console.log(`Empty extract for: ${title}`);
        return this.createFallbackArticle(title);
      }

      return {
        title: page.title || title,
        extract: page.extract,
        fullUrl: page.fullurl || `https://${this.language}.wikipedia.org/wiki/${encodeURIComponent(page.title || title)}`,
        thumbnail: page.thumbnail?.source,
        categories: page.categories?.map((cat: any) =>
          cat.title.replace('Category:', '').replace('Categoria:', '').replace('Categoría:', '')
        ) || [],
      };
    } catch (error) {
      console.error('Error fetching Wikipedia article:', error);
      return this.createFallbackArticle(title);
    }
  }

  private createFallbackArticle(title: string): WikipediaArticle {
    return {
      title: title,
      extract: `${title} é um tópico de estudo importante. Este conteúdo está sendo gerado automaticamente pois não foi encontrado um artigo específico na Wikipedia.\n\nPara aprender mais sobre ${title}, recomendamos assistir os vídeos disponíveis e consultar outras fontes confiáveis de informação.`,
      fullUrl: `https://${this.language}.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(title)}`,
      categories: ['Educação', 'Aprendizado'],
    };
  }

  async getArticleByPageId(pageId: number): Promise<WikipediaArticle | null> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts|pageimages|info',
        exintro: 'true',
        explaintext: 'true',
        pageids: pageId.toString(),
        format: 'json',
        origin: '*',
        pithumbsize: '500',
        inprop: 'url',
      });

      const response = await fetch(`${this.getApiUrl()}?${params}`);
      const data = await response.json();

      const page = data.query.pages[pageId];

      if (!page || page.missing) {
        return null;
      }

      return {
        title: page.title,
        extract: page.extract || 'Conteúdo não disponível.',
        fullUrl: page.fullurl,
        thumbnail: page.thumbnail?.source,
      };
    } catch (error) {
      console.error('Error fetching Wikipedia article by ID:', error);
      return null;
    }
  }

  async getSummary(title: string): Promise<string> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts',
        exintro: 'true',
        explaintext: 'true',
        titles: title,
        format: 'json',
        origin: '*',
        redirects: '1',
      });

      const response = await fetch(`${this.getApiUrl()}?${params}`);
      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1') {
        return 'Resumo não disponível.';
      }

      return pages[pageId].extract || 'Resumo não disponível.';
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      return 'Erro ao buscar resumo.';
    }
  }

  async getRelatedTopics(title: string, limit: number = 5): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        prop: 'links',
        titles: title,
        format: 'json',
        origin: '*',
        pllimit: limit.toString(),
      });

      const response = await fetch(`${this.getApiUrl()}?${params}`);
      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];

      if (pageId === '-1' || !pages[pageId].links) {
        return [];
      }

      return pages[pageId].links.map((link: any) => link.title);
    } catch (error) {
      console.error('Error fetching related topics:', error);
      return [];
    }
  }

  setLanguage(language: 'en' | 'pt'): void {
    this.language = language;
  }

  private stripHtml(html: string): string {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

export const wikipediaService = new WikipediaService('pt');
