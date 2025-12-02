import { ExternalLink, BookOpen, Tag } from 'lucide-react';
import { WikipediaArticle } from '../services/wikipediaService';

interface WikipediaContentProps {
  article: WikipediaArticle;
  relatedTopics?: string[];
}

export function WikipediaContent({ article, relatedTopics = [] }: WikipediaContentProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header com imagem */}
      {article.thumbnail && (
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <img
            src={article.thumbnail}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Conteúdo */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 flex-1">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h3>
          </div>
          <a
            href={article.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Ver na Wikipedia
          </a>
        </div>

        {/* Categorias */}
        {article.categories && article.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.categories.slice(0, 5).map((category, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
              >
                <Tag className="w-3 h-3" />
                {category}
              </span>
            ))}
          </div>
        )}

        {/* Texto do artigo */}
        <div className="prose dark:prose-invert max-w-none">
          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {article.extract}
          </div>
        </div>

        {/* Tópicos Relacionados */}
        {relatedTopics && relatedTopics.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Tópicos Relacionados
            </h4>
            <div className="flex flex-wrap gap-2">
              {relatedTopics.map((topic, index) => (
                <a
                  key={index}
                  href={`https://pt.wikipedia.org/wiki/${encodeURIComponent(topic)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {topic}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Este conteúdo é fornecido pela Wikipedia e está licenciado sob{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              CC BY-SA 3.0
            </a>
            . Pode conter informações desatualizadas ou imprecisas.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente de loading para o conteúdo da Wikipedia
export function WikipediaContentSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  );
}
