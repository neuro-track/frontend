import { Roadmap, LearningNode, Task } from '../types';
import { getLayoutedElements } from '../utils/graphLayout';
import { Edge } from '@xyflow/react';
import { contentGeneratorService } from './contentGeneratorService';

/**
 * Chat Message Interface
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

/**
 * Extracted Profile from Conversation
 */
export interface ExtractedProfile {
  learningGoal?: string;
  targetRole?: string;
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  interestTags: Record<string, number>;
  knowledgeGaps: string[];
  desiredTechnologies: string[];
}

/**
 * Streaming callback type
 */
export type StreamCallback = (chunk: string) => void;

/**
 * AI Service for Roadmap Generation
 */
export class AIService {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.model = 'gpt-4o-mini'; // Cheaper and faster for production
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Stream chat response in real-time
   */
  async streamChatResponse(
    messages: ChatMessage[],
    onChunk: StreamCallback
  ): Promise<string> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${error}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;

            if (content) {
              fullResponse += content;
              onChunk(content);
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }
    }

    return fullResponse;
  }

  /**
   * Analyze conversation to extract user profile
   */
  async analyzeConversation(messages: ChatMessage[]): Promise<ExtractedProfile> {
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const systemPrompt = `Você é um assistente especializado em análise de perfil de aprendizado.

Analise a conversa do usuário e extraia as seguintes informações:

1. **Learning Goal**: Meta principal de aprendizado
   Exemplos: "se tornar desenvolvedor full stack", "aprender data science", "dominar React"

2. **Target Role**: Cargo/papel profissional desejado
   Exemplos: "Full Stack Developer", "Data Scientist", "Frontend Engineer"

3. **Current Level**: Nível técnico atual
   - beginner: pouca ou nenhuma experiência
   - intermediate: conhecimento básico, já desenvolveu projetos pequenos
   - advanced: experiência profissional, domina conceitos fundamentais

4. **Interest Tags**: Tecnologias mencionadas com interesse (0-1 score de confiança)
   Exemplo: { "react": 0.9, "nodejs": 0.7, "python": 0.5 }

5. **Knowledge Gaps**: Skills que o usuário NÃO domina mas quer aprender
   Exemplo: ["docker", "kubernetes", "graphql"]

6. **Desired Technologies**: Tecnologias explicitamente mencionadas
   Exemplo: ["react", "typescript", "nodejs"]

Regras:
- Se o usuário não mencionar algo, use null ou array vazio
- Scores de interesse: 0.9-1.0 = muito interesse, 0.7-0.8 = interesse moderado, 0.5-0.6 = mencionou brevemente
- Seja conservador com o nível: se não tiver certeza, use beginner

Retorne APENAS JSON válido no formato:
{
  "learningGoal": "string ou null",
  "targetRole": "string ou null",
  "currentLevel": "beginner" | "intermediate" | "advanced",
  "interestTags": {},
  "knowledgeGaps": [],
  "desiredTechnologies": []
}`;

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * Generate roadmap directly from conversation (OPTIMIZED - Single API call)
   */
  async generateRoadmapFromConversation(messages: ChatMessage[]): Promise<Roadmap> {
    const timestamp = Date.now();
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');

    const systemPrompt = `Você é um arquiteto de roadmaps de aprendizado especializado em criar caminhos educacionais coesos e bem estruturados.

Analise a conversa do usuário e crie um roadmap de aprendizado MUITO BEM ESTRUTURADO e ALTAMENTE FOCADO no objetivo específico dele.

🎯 **OBJETIVO PRINCIPAL**: Criar um roadmap COESO onde cada lição seja diretamente relevante ao objetivo do usuário.

Regras Obrigatórias:

1. **Estrutura Principal**:
   - id: "generated-roadmap-${timestamp}"
   - title: Título descritivo do roadmap (baseado no objetivo do usuário)
   - description: 1-2 frases sobre o que o usuário aprenderá
   - totalNodes: (será calculado automaticamente)
   - completedNodes: 0
   - categories: array de 4-6 categorias (focadas e relevantes!)
   - nodes: array de 25-35 nodes (qualidade > quantidade)

2. **Categorias (4-6 APENAS)**:
   - APENAS categorias diretamente relevantes ao objetivo do usuário
   - NÃO adicione categorias genéricas ou fora do escopo
   - Ordem lógica de progressão no aprendizado
   - Cada categoria: id, name, description, color (hex variado), totalNodes, nodeIds, completedNodes: 0

   Exemplo para "Desenvolvedor Full Stack":
   ✅ BOM: "Fundamentos Web", "Frontend Moderno", "Backend e APIs", "Banco de Dados", "Deploy e DevOps"
   ❌ RUIM: "Fundamentos de Computação", "Algoritmos Avançados", "Machine Learning" (fora do escopo!)

3. **Nodes (25-35 total)**:
   - 5-7 nodes por categoria (balanceado)
   - Títulos ESPECÍFICOS e CLAROS (ex: "React Hooks (useState, useEffect)" em vez de "React Avançado")
   - Descrições que explicam EXATAMENTE o que será aprendido
   - Cada node DEVE ser necessário para o objetivo final
   - Tags TÉCNICAS e ESPECÍFICAS (ex: "react", "hooks", "useState", "useEffect")
   - Campos obrigatórios: id, title, description, type, categoryIds (array), difficulty, estimatedMinutes, prerequisites (array), tags, courseId: "generated-roadmap-${timestamp}", status: "not-started", progress: 0, position: {x: 0, y: 0}, tasks (2-4 tarefas)

4. **Tasks (2-4 por node) - COM CONTEÚDO REAL**:
   - Tarefas ESPECÍFICAS ao tópico do node
   - Títulos descritivos do que será feito
   - Conteúdo relevante e aplicável
   - Tipos: quiz, coding-challenge, reading, video-watch
   - Cada task: id, nodeId, title, type, content (específico do tipo), status: "not-started", attempts: 0, estimatedMinutes

5. **Prerequisites Inteligentes**:
   - Fundamentos SEMPRE antes de conceitos avançados
   - Exemplo: HTML → CSS → JavaScript → React → Next.js
   - NÃO pule etapas essenciais
   - Cada node só pode depender de nodes que existem no roadmap

🚨 **VALIDAÇÕES CRÍTICAS**:
- Todos os nodes 100% relevantes ao objetivo
- Nenhuma categoria fora do escopo
- Títulos específicos, não genéricos
- Tags técnicas precisas

Retorne APENAS JSON válido no formato especificado.`;

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: conversationText },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    const roadmap = JSON.parse(data.choices[0].message.content);

    // Validate and post-process
    return this.postProcessRoadmap(roadmap);
  }

  /**
   * Generate roadmap with tasks from extracted profile (LEGACY - Kept for compatibility)
   */
  async generateRoadmap(profile: ExtractedProfile): Promise<Roadmap> {
    const timestamp = Date.now();
    const profileJSON = JSON.stringify(profile, null, 2);

    const systemPrompt = `Você é um arquiteto de roadmaps de aprendizado especializado.

Com base no perfil do usuário fornecido, crie um roadmap de aprendizado estruturado e personalizado.

Regras Obrigatórias:

1. **Categorias (4-8)**:
   - Relevantes ao objetivo do usuário
   - Cada categoria deve ter:
     - id único (kebab-case)
     - name (português)
     - description
     - icon (emoji único)
     - color (hex code variado)
     - totalNodes (calculado)
     - nodeIds (array de IDs dos nodes)
     - completedNodes: 0

2. **Nodes (20-40 total)**:
   - 3-8 nodes por categoria
   - Cada node deve ter:
     - id único (kebab-case)
     - title (português, claro e específico)
     - description (1-2 frases explicativas)
     - type: "concept" | "practice" | "project" | "assessment" | "milestone"
     - categoryIds: array (pode ter múltiplas categorias!)
     - difficulty: "beginner" | "intermediate" | "advanced" | "expert"
     - estimatedMinutes: 15-180 (realista)
     - prerequisites: array de IDs (ordem lógica de aprendizado)
     - tags: array de 3-5 strings relevantes
     - courseId: "generated-roadmap-${timestamp}"
     - status: "not-started"
     - progress: 0
     - position: { x: 0, y: 0 } (será recalculado)
     - tasks: array de 2-4 tasks (OBRIGATÓRIO!)

3. **Tasks (2-4 por node)**:
   Cada node DEVE ter tasks variadas:
   - Quiz: perguntas de múltipla escolha (2-4 questões)
   - Coding Challenge: desafio de código com casos de teste
   - Reading: leitura de artigo/documentação
   - Video Watch: vídeo educacional

   Formato de Task:
   {
     "id": "node-id-task-type",
     "nodeId": "node-id",
     "title": "Título da tarefa",
     "type": "quiz" | "coding-challenge" | "reading" | "video-watch",
     "content": { ... conteúdo específico do tipo ... },
     "status": "not-started",
     "attempts": 0,
     "estimatedMinutes": 10-30
   }

   **Quiz Content**:
   {
     "questions": [
       {
         "question": "Pergunta clara",
         "options": ["A", "B", "C", "D"],
         "correctAnswer": 0,
         "explanation": "Explicação da resposta"
       }
     ]
   }

   **Coding Challenge Content**:
   {
     "description": "Descrição do desafio",
     "starterCode": "function exemplo() { ... }",
     "testCases": [
       {
         "input": "exemplo(5)",
         "expected": "25",
         "description": "Calcula quadrado de 5"
       }
     ],
     "hints": ["Dica 1", "Dica 2"]
   }

   **Reading Content**:
   {
     "url": "https://...",
     "description": "O que você aprenderá",
     "keyPoints": ["Ponto 1", "Ponto 2"]
   }

   **Video Watch Content**:
   {
     "videoUrl": "https://youtube.com/...",
     "duration": "15min",
     "keyTopics": ["Tópico 1", "Tópico 2"]
   }

4. **Prerequisites Inteligentes**:
   - HTML antes de CSS
   - CSS antes de JavaScript
   - JavaScript antes de frameworks
   - Conceitos antes de prática
   - Fundamentos antes de projetos

5. **Multi-Categoria**:
   - Nodes transversais em múltiplas categorias
   - Exemplo: "API REST" → ["backend", "apis"]

6. **Progressão de Dificuldade**:
   - Começar com beginner
   - Progredir gradualmente
   - Advanced/Expert apenas no final

Retorne APENAS JSON válido no formato:
{
  "id": "generated-roadmap-${timestamp}",
  "title": "Roadmap: {objetivo}",
  "description": "Caminho personalizado para {objetivo}",
  "icon": "🚀",
  "color": "#3B82F6",
  "categories": [...],
  "nodes": [...],
  "totalNodes": 0,
  "completedNodes": 0
}

IMPORTANTE:
- Todos os nodes DEVEM ter tasks
- Todos os IDs devem ser únicos
- Todos os prerequisites devem existir
- Todos os categoryIds devem existir
- Não use posições reais (serão calculadas)`;

    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: profileJSON },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.statusText} - ${error}`);
    }

    const data = await response.json();
    const roadmap = JSON.parse(data.choices[0].message.content);

    // Validate and post-process
    return this.postProcessRoadmap(roadmap);
  }

  /**
   * Post-process roadmap: validate, calculate positions, fix issues
   */
  private postProcessRoadmap(roadmap: any): Roadmap {
    // Ensure all required fields exist
    if (!roadmap.id || !roadmap.categories || !roadmap.nodes) {
      throw new Error('Invalid roadmap structure from AI');
    }

    // Calculate total nodes
    roadmap.totalNodes = roadmap.nodes.length;
    roadmap.completedNodes = 0;

    // Update category node counts and IDs
    const categoryNodeMap: Record<string, string[]> = {};
    roadmap.nodes.forEach((node: LearningNode) => {
      if (node.categoryIds && Array.isArray(node.categoryIds)) {
        node.categoryIds.forEach(catId => {
          if (!categoryNodeMap[catId]) {
            categoryNodeMap[catId] = [];
          }
          categoryNodeMap[catId].push(node.id);
        });
      }
    });

    roadmap.categories.forEach((cat: any) => {
      cat.nodeIds = categoryNodeMap[cat.id] || [];
      cat.totalNodes = cat.nodeIds.length;
      cat.completedNodes = 0;
    });

    // Ensure all nodes have correct courseId, categoryIds, and tasks
    roadmap.nodes.forEach((node: LearningNode) => {
      // Ensure courseId matches roadmap ID
      node.courseId = roadmap.id;

      // Ensure categoryIds is not undefined
      if (!node.categoryIds || !Array.isArray(node.categoryIds)) {
        node.categoryIds = [roadmap.categories[0].id];
      }

      // Ensure node has initial status and progress
      if (!node.status) node.status = 'available';
      if (node.progress === undefined) node.progress = 0;

      if (node.tasks) {
        node.tasks.forEach((task: Task) => {
          task.nodeId = node.id;
          if (!task.status) task.status = 'not-started';
          if (!task.attempts) task.attempts = 0;
        });
      } else {
        // If AI forgot tasks, create default tasks that will be enriched with real content
        // Note: Content will be generated asynchronously when the task is first accessed

        // Map node difficulty to task difficulty
        const taskDifficulty: 'easy' | 'medium' | 'hard' =
          node.difficulty === 'beginner' ? 'easy' :
          node.difficulty === 'advanced' || node.difficulty === 'expert' ? 'hard' :
          'medium';

        node.tasks = [
          {
            id: `${node.id}-reading`,
            nodeId: node.id,
            title: `Leitura: ${node.title}`,
            description: `Artigos e material de leitura sobre ${node.title}`,
            type: 'reading',
            difficulty: taskDifficulty,
            content: {
              url: `https://pt.wikipedia.org/wiki/${encodeURIComponent(node.title)}`,
              // Rich content will be populated by contentGeneratorService on demand
            },
            status: 'not-started',
            attempts: 0,
            estimatedMinutes: 15,
          },
          {
            id: `${node.id}-exercise`,
            nodeId: node.id,
            title: `Exercício: ${node.title}`,
            description: `Atividades práticas sobre ${node.title}`,
            type: 'exercise',
            difficulty: taskDifficulty,
            content: {
              // Rich exercise content will be populated by contentGeneratorService on demand
            },
            status: 'not-started',
            attempts: 0,
            estimatedMinutes: 30,
          },
          {
            id: `${node.id}-quiz`,
            nodeId: node.id,
            title: `Quiz: ${node.title}`,
            description: `Avalie seu conhecimento sobre ${node.title}`,
            type: 'quiz',
            difficulty: taskDifficulty,
            content: {
              questions: [
                {
                  id: `${node.id}-q1`,
                  question: `Qual é o conceito principal de ${node.title}?`,
                  options: [
                    'Opção 1 (você descobrirá estudando)',
                    'Opção 2',
                    'Opção 3',
                    'Opção 4',
                  ],
                  correctAnswer: 0,
                  explanation: `Estude o material sobre ${node.title} para aprender mais.`,
                },
              ],
            },
            status: 'not-started',
            attempts: 0,
            estimatedMinutes: 10,
          },
        ];
      }
    });

    // Calculate positions with Dagre
    return this.layoutRoadmap(roadmap);
  }

  /**
   * Calculate node positions using Dagre layout
   */
  private layoutRoadmap(roadmap: Roadmap): Roadmap {
    const edges = this.generateEdges(roadmap.nodes);

    // Convert LearningNodes to ReactFlow Nodes for layout
    const reactFlowNodes = roadmap.nodes.map(n => ({
      id: n.id,
      type: 'custom',
      position: { x: 0, y: 0 },
      data: {
        learningNode: n,
        isSelected: false,
      },
    }));

    const { nodes: layoutedNodes } = getLayoutedElements(
      reactFlowNodes,
      edges,
      {
        direction: 'TB',
        rankSep: 150,
        nodeSep: 100,
      }
    );

    // Extract LearningNodes with updated positions
    const updatedNodes: LearningNode[] = layoutedNodes.map((node: any) => ({
      ...node.data.learningNode,
      position: node.position,
    }));

    return {
      ...roadmap,
      nodes: updatedNodes,
    };
  }

  /**
   * Enrich a task with real content from external APIs (Wikipedia, YouTube)
   * Call this when displaying a task to populate rich content on-demand
   */
  async enrichTaskContent(task: Task, nodeTopic: string): Promise<Task> {
    // Skip if task already has rich content
    if (task.type === 'exercise' && task.content?.exercise) {
      return task;
    }
    if (task.type === 'reading' && task.content?.reading) {
      return task;
    }

    try {
      if (task.type === 'exercise') {
        const exerciseContent = await contentGeneratorService.generateExerciseContent(
          nodeTopic,
          task.difficulty || 'medium'
        );
        return {
          ...task,
          content: {
            ...task.content,
            exercise: exerciseContent,
          },
        };
      }

      if (task.type === 'reading') {
        const readingContent = await contentGeneratorService.generateReadingMaterial(nodeTopic);
        return {
          ...task,
          content: {
            ...task.content,
            reading: readingContent,
          },
        };
      }

      // For other task types, return as-is
      return task;
    } catch (error) {
      console.error('Error enriching task content:', error);
      // Return original task on error
      return task;
    }
  }

  /**
   * Generate edges from prerequisites
   */
  private generateEdges(nodes: LearningNode[]): Edge[] {
    const edges: Edge[] = [];

    for (const node of nodes) {
      for (const prereqId of node.prerequisites) {
        edges.push({
          id: `${prereqId}-${node.id}`,
          source: prereqId,
          target: node.id,
          type: 'smoothstep',
        });
      }
    }

    return edges;
  }
}

/**
 * Singleton instance
 */
// @ts-ignore - Vite specific import.meta.env
const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || '';

export const aiService = new AIService(apiKey);
