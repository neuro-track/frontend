# Integração YouTube e Wikipedia

Este documento explica como funciona a integração com YouTube e Wikipedia para gerar conteúdo dinâmico das lições.

## 📺 YouTube Integration

### Como Funciona

O sistema busca automaticamente vídeos relacionados ao tópico da lição usando a API do YouTube. Os vídeos são exibidos em um player integrado com tracking de eventos.

### Configuração

1. **Obter API Key do YouTube:**
   - Acesse https://console.cloud.google.com/apis/credentials
   - Crie um novo projeto ou selecione um existente
   - Ative a YouTube Data API v3
   - Crie credenciais (API Key)
   - Copie a API key gerada

2. **Configurar no Projeto:**
   ```bash
   # Copie o arquivo de exemplo
   cp .env.example .env

   # Edite o arquivo .env e adicione sua API key
   VITE_YOUTUBE_API_KEY=sua_api_key_aqui
   ```

3. **Sem API Key (Modo Demo):**
   - O sistema funciona sem API key usando vídeos mock
   - Vídeos de demonstração serão exibidos
   - Ideal para desenvolvimento e testes

### Funcionalidades

- **Busca Automática:** Vídeos são buscados automaticamente baseados no título da lição
- **Filtros:** Duração (curto, médio, longo), idioma, ordenação
- **Player Integrado:** Iframe do YouTube com controles nativos
- **Tracking:** Eventos de play, pause e conclusão são rastreados
- **Thumbnails:** Miniaturas de alta qualidade
- **Metadados:** Título, descrição, canal, visualizações, duração

### Exemplo de Uso

```typescript
import { youtubeService } from './services/youtubeService';

// Buscar vídeos
const videos = await youtubeService.searchVideos({
  query: 'React Hooks tutorial português',
  maxResults: 5,
  order: 'relevance',
  videoDuration: 'medium',
  language: 'pt'
});

// Obter vídeo específico
const video = await youtubeService.getVideoById('dQw4w9WgXcQ');
```

## 📚 Wikipedia Integration

### Como Funciona

O sistema busca automaticamente artigos da Wikipedia relacionados ao tópico da lição. A API da Wikipedia é pública e não requer configuração.

### Funcionalidades

- **Busca Automática:** Artigos são buscados baseados no título da lição
- **Múltiplos Idiomas:** Suporte para português e inglês
- **Resumos:** Extratos introdutórios dos artigos
- **Imagens:** Thumbnails quando disponíveis
- **Categorias:** Tags e categorias do artigo
- **Tópicos Relacionados:** Links para artigos relacionados
- **Link Direto:** Acesso rápido ao artigo completo na Wikipedia

### Exemplo de Uso

```typescript
import { wikipediaService } from './services/wikipediaService';

// Configurar idioma
wikipediaService.setLanguage('pt');

// Buscar artigo
const article = await wikipediaService.getArticle('JavaScript');

// Buscar artigos relacionados
const results = await wikipediaService.search('React', 5);

// Obter resumo
const summary = await wikipediaService.getSummary('TypeScript');

// Obter tópicos relacionados
const topics = await wikipediaService.getRelatedTopics('Node.js', 5);
```

## 🎨 Content Generator Service

O serviço de geração de conteúdo combina YouTube e Wikipedia para criar lições completas.

### Uso Básico

```typescript
import { contentGeneratorService } from './services/contentGeneratorService';

// Gerar conteúdo completo da lição
const content = await contentGeneratorService.generateLessonContent(
  'React Hooks',
  {
    maxVideos: 3,
    videoDuration: 'medium',
    language: 'pt'
  }
);

// content contém:
// - videos: Array de vídeos do YouTube
// - article: Artigo da Wikipedia
// - relatedTopics: Tópicos relacionados
// - estimatedReadingTime: Tempo estimado de leitura
```

### Enriquecimento Automático

```typescript
// Enriquecer um nó de curso automaticamente
const lessonContent = await contentGeneratorService.enrichCourseNode('HTML Basics');
```

## 🎯 Componentes

### VideoPlayer

Componente para exibir vídeos do YouTube:

```tsx
import { VideoPlayer } from './components/VideoPlayer';

<VideoPlayer
  video={video}
  nodeId={nodeId}
  autoPlay={false}
/>
```

### VideoList

Lista de vídeos com player principal:

```tsx
import { VideoList } from './components/VideoPlayer';

<VideoList
  videos={videos}
  nodeId={nodeId}
/>
```

### WikipediaContent

Exibir conteúdo da Wikipedia:

```tsx
import { WikipediaContent } from './components/WikipediaContent';

<WikipediaContent
  article={article}
  relatedTopics={relatedTopics}
/>
```

### LessonScreenEnhanced

Tela de lição completa com conteúdo dinâmico:

```tsx
import { LessonScreenEnhanced } from './components/LessonScreenEnhanced';

// Já integrado no App.tsx
<Route path="/lesson/:courseId/:nodeId" element={<LessonScreenEnhanced />} />
```

## 🔧 Configuração Avançada

### Personalizar Busca de Vídeos

```typescript
const videos = await youtubeService.searchVideos({
  query: 'Python programming',
  maxResults: 10,
  order: 'rating', // 'date', 'relevance', 'title', 'viewCount'
  videoDuration: 'long', // 'short', 'medium', 'long'
  language: 'en'
});
```

### Trocar Idioma da Wikipedia

```typescript
// Português
wikipediaService.setLanguage('pt');

// Inglês
wikipediaService.setLanguage('en');
```

### Personalizar Geração de Conteúdo

```typescript
const content = await contentGeneratorService.generateLessonContent(
  'Advanced TypeScript',
  {
    maxVideos: 5,        // Número de vídeos
    videoDuration: 'long', // Duração preferida
    language: 'en'        // Idioma
  }
);
```

## 📊 Tracking de Eventos

Os vídeos automaticamente rastreiam:

- **Access:** Quando um vídeo é acessado
- **Play:** Quando o vídeo começa
- **Pause:** Quando o vídeo é pausado
- **Complete:** Quando o vídeo é completado

```typescript
import { eventTracker } from './utils/eventTracker';

// Eventos são rastreados automaticamente pelo VideoPlayer
// Mas você pode rastrear manualmente se necessário
eventTracker.trackPlay(userId, videoId);
eventTracker.trackPause(userId, videoId, currentTime);
eventTracker.trackComplete(userId, videoId, 'video');
```

## 🚀 Performance

### Cache

- **Wikipedia:** Sem cache implementado (API é rápida)
- **YouTube:** Sem cache implementado
- **Recomendação:** Implementar cache no futuro para melhor performance

### Otimizações

- Chamadas paralelas para YouTube e Wikipedia
- Limite de resultados configurável
- Fallback para dados mock quando API não disponível

## 🐛 Troubleshooting

### Vídeos não carregam

1. Verifique se a API key está configurada corretamente no `.env`
2. Verifique se a API key tem permissões para YouTube Data API v3
3. Verifique se não excedeu a quota diária da API (10.000 requisições/dia)
4. Verifique o console do navegador para erros

### Artigos da Wikipedia não carregam

1. Verifique sua conexão com a internet
2. Verifique se há CORS errors no console
3. Tente trocar o idioma: `wikipediaService.setLanguage('en')`
4. Verifique se o tópico existe na Wikipedia

### Erro "import.meta.env is undefined"

- Este erro foi corrigido usando `(import.meta as any).env`
- Certifique-se de usar Vite como bundler
- Variáveis de ambiente devem começar com `VITE_`

## 📝 Limitações

### YouTube API

- **Quota:** 10.000 unidades/dia (gratuito)
- **Custos:** Cada busca custa ~100 unidades
- **Rate Limit:** Pode haver limite de requisições por segundo
- **Sem API Key:** Sistema funciona com vídeos mock

### Wikipedia API

- **Rate Limit:** Limite de requisições por segundo (geralmente 200/s)
- **Conteúdo:** Nem todos os tópicos têm artigos
- **Idioma:** Conteúdo varia entre idiomas
- **Estrutura:** Alguns artigos podem estar mal formatados

## 🔐 Segurança

### API Keys

- **Nunca** commite API keys no git
- Use arquivo `.env` (já está no `.gitignore`)
- Para produção, use variáveis de ambiente do servidor
- Restrinja API keys por domínio/IP no Google Cloud Console

### CORS

- YouTube e Wikipedia têm CORS habilitado
- APIs são chamadas do cliente (navegador)
- Sem proxy necessário para desenvolvimento

## 🎓 Boas Práticas

1. **Sempre forneça fallback:** Use dados mock quando APIs falham
2. **Cache resultados:** Implemente cache para reduzir chamadas à API
3. **Loading states:** Sempre mostre indicadores de carregamento
4. **Error handling:** Trate erros graciosamente
5. **Limites:** Respeite quotas e rate limits das APIs
6. **Testes:** Teste com e sem API keys configuradas

## 📚 Referências

- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
