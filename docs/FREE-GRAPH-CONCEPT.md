# Free Graph View - Conceito de Aprendizagem Não-Linear

## O Que É

O **FreeGraphView** é um grafo direcionado não-linear que representa caminhos de aprendizagem personalizados. Ele quebra cursos tradicionais em **nós de aprendizagem atômicos** conectados por **pré-requisitos sugeridos**, permitindo ao usuário escolher seu próprio caminho de aprendizado.

### Conceito Central

**Roadmap/Curso → Quebrado em Nós Atômicos → Aprendizagem Não-Linear**

```
Roadmap: "Full Stack JavaScript"
├── Categoria: HTML/CSS (5 nós)
├── Categoria: JavaScript (8 nós)
├── Categoria: React (7 nós)
└── Categoria: Node.js (6 nós)

Total: 26 nós de aprendizagem interconectados
```

## Estrutura de Dados

### LearningNode (Nó de Aprendizagem)

Cada nó representa uma **unidade de aprendizagem atômica** - um conceito ou habilidade específica que pode ser aprendida de forma independente.

```typescript
interface LearningNode {
  id: string;
  title: string;                    // Ex: "Componentes React"
  description: string;               // Explicação breve do conceito
  type: 'reading' | 'video' | 'quiz' | 'coding';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedMinutes: number;          // Tempo estimado para completar

  // Relacionamentos
  prerequisites: string[];           // IDs de nós pré-requisitos
  categoryIds: string[];             // Pode pertencer a múltiplas categorias

  // Estado do usuário
  status: 'available' | 'in-progress' | 'completed';
  position: { x: number; y: number }; // Calculado por Dagre

  // Conteúdo
  tasks: Task[];                     // 2-4 tarefas práticas
}
```

### Exemplo Real de Nó

```typescript
{
  id: "react-components",
  title: "Componentes React",
  description: "Aprenda a criar componentes reutilizáveis com React",
  type: "coding",
  difficulty: "intermediate",
  estimatedMinutes: 45,

  prerequisites: ["javascript-basics", "jsx-syntax"],
  categoryIds: ["react", "frontend"],

  status: "available",
  position: { x: 450, y: 600 },  // Calculado automaticamente

  tasks: [
    { type: "reading", title: "Leia sobre componentes" },
    { type: "video", title: "Assista: Criando seu primeiro componente" },
    { type: "coding", title: "Exercício: Crie um Card componente" },
    { type: "quiz", title: "Quiz: Props vs State" }
  ]
}
```

## Como Funciona

### 1. Pré-requisitos: Soft Recommendations

Os pré-requisitos são **sugestões visuais**, não bloqueios:

- ✅ **Usuário PODE** começar qualquer nó a qualquer momento
- 🔍 **Grafo MOSTRA** o caminho recomendado via setas
- ⚠️ **Sistema INDICA** quando há pré-requisitos incompletos (cor diferente)
- 🎓 **Aprendiz DECIDE** seu próprio caminho

```
Exemplo:
  HTML Básico ──→ CSS Básico ──→ Layout Flexbox
       ↓              ↓               ↓
  [Verde]       [Amarelo]        [Amarelo]
  Completo     Disponível       Disponível

O usuário PODE pular CSS Básico e ir direto para Layout Flexbox,
mas o grafo mostra visualmente que CSS Básico é recomendado antes.
```

### 2. Layout Inteligente com Dagre

O algoritmo **Dagre** posiciona os nós automaticamente baseado nas dependências:

```typescript
// Configuração do layout hierárquico
const g = new dagre.graphlib.Graph();
g.setGraph({
  rankdir: 'TB',      // Top to Bottom (pré-requisitos ACIMA)
  nodesep: 150,       // Espaçamento horizontal entre nós
  ranksep: 200,       // Espaçamento vertical entre níveis
  marginx: 50,        // Margem do grafo
  marginy: 50,
});

// Dagre garante:
// - Pré-requisitos sempre aparecem ACIMA
// - Nós do mesmo nível ficam ALINHADOS horizontalmente
// - Setas fluem de cima para baixo
```

**Resultado Visual:**
```
Nível 0 (Fundamentos):
    [HTML]    [CSS]

Nível 1 (Intermediário):
    [JavaScript Básico]

Nível 2 (Frameworks):
    [React]    [Vue]

Nível 3 (Avançado):
    [Next.js]
```

### 3. Multi-Categoria

Um nó pode pertencer a **múltiplas categorias** simultaneamente:

```typescript
{
  id: "rest-api",
  title: "Criando APIs REST",
  categoryIds: ["backend", "apis", "http", "nodejs"],
  // Aparece em 4 categorias diferentes!
}
```

Isso permite diferentes "visões" do mesmo roadmap:
- **Visão Backend**: Mostra APIs, Bancos de Dados, Autenticação
- **Visão APIs**: Mostra REST, GraphQL, WebSockets
- **Visão HTTP**: Mostra Protocolo HTTP, APIs, Requests

## Visualização

### Cores dos Nós

```
🟢 Verde   = status: 'completed'     (Nó completo)
🔵 Azul    = status: 'in-progress'   (Nó em andamento)
🟡 Amarelo = status: 'available'     (Nó disponível)
```

### Indicadores de Dificuldade

Pequeno círculo no canto superior direito do nó:

```
🟢 Verde  = difficulty: 'beginner'
🟡 Amarelo = difficulty: 'intermediate'
🔴 Vermelho = difficulty: 'advanced'
🟣 Roxo   = difficulty: 'expert'
```

### Arestas (Setas)

```
──────→  Cinza:  Pré-requisito normal
──────→  Verde:  Ambos nós completos (caminho concluído)
──────→  Azul:   Nó de destino em progresso
━━━━━→  Animado: Parte do caminho personalizado recomendado
```

## Interação do Usuário

### 1. Clique no Nó
```typescript
onNodeClick(node: LearningNode) {
  // Abre painel lateral com:
  // - Descrição detalhada
  // - Lista de pré-requisitos
  // - Tarefas para completar (quiz, coding, etc.)
  // - Botão "Iniciar" ou "Continuar"
}
```

### 2. Arrastar e Reorganizar
```typescript
// Usuário pode mover nós manualmente
// Layout Dagre é ponto de partida, não prisão
draggable: true
```

### 3. Zoom e Pan
```typescript
<ReactFlow
  minZoom={0.1}   // Zoom out para ver grafo completo
  maxZoom={4}     // Zoom in para focar em detalhes
  fitView         // Centraliza automaticamente
/>
```

### 4. Mini-Mapa
```typescript
<MiniMap
  position="bottom-left"
  nodeColor={node => getStatusColor(node.status)}
/>
// Navegação rápida em grafos grandes (30+ nós)
```

## Exemplo Completo: Roadmap JavaScript

```
┌─────────────────────────────────────────────────────────┐
│                 Roadmap: Full Stack JavaScript          │
└─────────────────────────────────────────────────────────┘

Nível 0 (Fundamentos):
    ●───────────●───────────●
  [HTML5]    [CSS3]    [Git Básico]
  Verde      Verde      Amarelo

Nível 1 (Programação):
         ●────────────●
    [JS Básico]  [ES6+]
      Azul       Amarelo

Nível 2 (DOM & Assíncrono):
    ●──────────●──────────●
  [DOM]   [Promises]  [Async/Await]
  Amarelo  Amarelo     Amarelo

Nível 3 (Frontend Framework):
         ●────────────●
      [React]    [React Hooks]
      Amarelo    Amarelo

Nível 4 (Backend):
    ●──────────●──────────●
 [Node.js] [Express] [MongoDB]
  Amarelo   Amarelo   Amarelo

Nível 5 (Full Stack):
         ●
    [Next.js]
     Amarelo

Total: 15 nós de aprendizagem
Completos: 2 (13%)
Em Progresso: 1 (7%)
Disponíveis: 12 (80%)
```

## Diferenças: Curso Linear vs Free Graph

### Curso Tradicional (Linear)
```
Lição 1 → Lição 2 → Lição 3 → Lição 4
   ✓         ✓         🔒       🔒
         (bloqueado até completar 2)

❌ Sem liberdade de escolha
❌ Um único caminho fixo
❌ Bloqueio forçado
```

### Free Graph (Não-Linear)
```
    Fundamentos
    ●     ●     ●
    ↓  ↙  ↓  ↘  ↓
    ●     ●     ●
    ↓  ↘  ↓  ↙  ↓
         ●

✅ Total liberdade de escolha
✅ Múltiplos caminhos válidos
✅ Pré-requisitos são sugestões
✅ Aprendizagem personalizada
```

## Vantagens do Sistema

### Para o Aprendiz
- 🎯 **Autonomia**: Escolhe seu próprio caminho
- 🔍 **Visibilidade**: Vê toda a jornada de uma vez
- ⚡ **Flexibilidade**: Pode pular conceitos já conhecidos
- 📊 **Progress Tracking**: Visualiza progresso em tempo real

### Para o Sistema
- 🧠 **Dados Ricos**: Captura ordem de aprendizado escolhida
- 🤖 **ML-Friendly**: Pode recomendar próximos nós baseado em padrões
- 📈 **Métricas**: Taxa de conclusão por caminho, tempo médio por nó
- 🔄 **Adaptável**: Fácil adicionar/remover nós sem quebrar estrutura

## Implementação Técnica

### Arquivo: src/components/FreeGraphView.tsx

```typescript
export function FreeGraphView({ nodes, onNodeClick }: FreeGraphViewProps) {
  // 1. Calcula layout inteligente com Dagre
  const nodesWithLayout = useMemo(
    () => calculateFreeGraphLayout(nodes),
    [nodes]
  );

  // 2. Converte para formato ReactFlow
  const flowNodes: Node[] = useMemo(
    () =>
      nodesWithLayout.map((node) => ({
        id: node.id,
        type: 'custom',
        position: { x: node.position.x, y: node.position.y },
        data: { node, onNodeClick },
      })),
    [nodesWithLayout, onNodeClick]
  );

  // 3. Cria arestas (setas) baseado em pré-requisitos
  const flowEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    nodes.forEach((node) => {
      node.prerequisites.forEach((prereqId) => {
        edges.push({
          id: `${prereqId}-${node.id}`,
          source: prereqId,
          target: node.id,
          animated: node.status === 'in-progress',
          style: { stroke: getEdgeColor(node.status) },
        });
      });
    });
    return edges;
  }, [nodes]);

  // 4. Renderiza grafo interativo
  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      nodeTypes={{ custom: CustomNode }}
      fitView
    >
      <Background variant={BackgroundVariant.Dots} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

### Arquivo: src/utils/graphLayout.ts

```typescript
/**
 * Calcula posições dos nós usando algoritmo Dagre
 */
export const calculateFreeGraphLayout = (
  nodes: LearningNode[]
): LearningNode[] => {
  const g = new dagre.graphlib.Graph();

  // Configuração hierárquica
  g.setGraph({
    rankdir: 'TB',
    nodesep: 150,
    ranksep: 200,
  });

  // Adiciona nós
  nodes.forEach(node => {
    g.setNode(node.id, { width: 120, height: 120 });
  });

  // Adiciona arestas (pré-requisitos)
  nodes.forEach(node => {
    node.prerequisites?.forEach(prereqId => {
      g.setEdge(prereqId, node.id);
    });
  });

  // Calcula layout
  dagre.layout(g);

  // Aplica posições calculadas
  return nodes.map(node => ({
    ...node,
    position: {
      x: g.node(node.id).x,
      y: g.node(node.id).y
    }
  }));
};
```

## Casos de Uso

### 1. Desenvolvedor Frontend Experiente
```
Usuário já sabe HTML/CSS/JS
↓
Pula fundamentos (já em verde)
↓
Vai direto para React
↓
Sistema mostra caminho recomendado: React Hooks → Context → Next.js
```

### 2. Iniciante Absoluto
```
Começa do zero
↓
Segue caminho linear recomendado (top-down)
↓
HTML → CSS → JavaScript → ...
↓
Grafo guia visualmente o caminho ideal
```

### 3. Aprendizagem Baseada em Projeto
```
Usuário quer construir app de e-commerce
↓
Sistema filtra nós relevantes:
- React (UI)
- Node.js (Backend)
- MongoDB (Database)
- Stripe API (Pagamentos)
↓
Pula tópicos não relacionados (Vue, GraphQL, etc.)
```

## Métricas e Analytics

### Dados Capturados
```typescript
interface UserLearningPath {
  userId: string;
  roadmapId: string;
  completedNodes: Array<{
    nodeId: string;
    completedAt: Date;
    timeSpentMinutes: number;
  }>;
  pathTaken: string[];  // Ordem de conclusão
  skippedPrerequisites: string[];  // Nós feitos sem pré-requisitos
}
```

### Insights Possíveis
- 📊 **Caminhos Populares**: Quais sequências são mais comuns?
- ⏱️ **Tempo Real**: Quanto tempo leva cada nó na prática?
- 🎯 **Taxa de Conclusão**: Quais nós têm maior abandono?
- 🔄 **Pré-requisitos Reais**: Quais dependências são realmente necessárias?

## Próximos Passos (Roadmap do Feature)

### ✅ Fase 1: Layout Inteligente (COMPLETO)
- [x] Integração com Dagre
- [x] Posicionamento hierárquico
- [x] Mini-mapa para navegação

### ✅ Fase 2: Documentação (COMPLETO)
- [x] JSDoc em FreeGraphView
- [x] Documento FREE-GRAPH-CONCEPT.md

### ⏳ Fase 3: Agrupamento Visual (PRÓXIMO)
- [ ] Fundos coloridos para categorias
- [ ] Labels de categoria
- [ ] Toggle para mostrar/ocultar agrupamentos

### ⏳ Fase 4: Melhorias UX
- [ ] Highlight de pré-requisitos ao hover
- [ ] Busca/filtro de nós
- [ ] Zoom para nó específico
- [ ] Exportar progresso como imagem

### 🔮 Futuro
- [ ] Recomendações ML (próximo nó sugerido)
- [ ] Caminho personalizado baseado em objetivos
- [ ] Colaboração (ver progresso de amigos)
- [ ] Badges e conquistas por caminho

## Conclusão

O **FreeGraphView** reimagina a aprendizagem online ao quebrar cursos lineares em grafos de conhecimento navegáveis. Ao combinar **liberdade total** (escolha qualquer nó) com **orientação visual** (setas mostram pré-requisitos), criamos uma experiência que respeita a autonomia do aprendiz enquanto oferece estrutura clara.

**Resultado**: Aprendizagem mais engajante, personalizada e eficiente.
