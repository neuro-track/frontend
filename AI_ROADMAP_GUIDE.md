# Guia: Geração de Roadmap com IA

## Implementação Completa ✅

O sistema de geração de roadmap personalizado com IA está 100% implementado e pronto para uso!

## Como Usar

### 1. Configurar API Key da OpenAI

Abra o arquivo `.env` e adicione sua API key da OpenAI:

```bash
VITE_OPENAI_API_KEY=sk-proj-seu-key-aqui
```

**Onde obter a API key:**
- Acesse: https://platform.openai.com/api-keys
- Crie uma nova chave
- Cole no arquivo `.env`

### 2. Iniciar a Aplicação

```bash
npm run dev
```

A aplicação estará em: http://localhost:3001/

### 3. Usar o Chat com IA

1. **Faça login** e vá para o Dashboard
2. **Clique em "Conversar com IA"** ou acesse `/chat`
3. **Converse com o assistente** sobre seus objetivos de aprendizado:

**Exemplos de conversas:**

```
Você: Quero me tornar desenvolvedor full stack

IA: [responde em tempo real via streaming]

Você: Tenho conhecimento básico de HTML e CSS, mas preciso aprender JavaScript, React e Node.js

IA: [responde]

Você: Quero começar com um nível iniciante e progredindo para intermediário
```

4. **Após 3+ mensagens**, o botão aparece:
   - "Gerar Roadmap Personalizado" 🎉

5. **Clique no botão** e aguarde:
   - A IA analisa sua conversa
   - Extrai seus objetivos e gaps de conhecimento
   - Gera um roadmap completo com:
     - 4-8 categorias relevantes
     - 20-40 lições (nodes)
     - 2-4 tarefas por lição
     - Prerequisites inteligentes
     - Dificuldade progressiva

6. **Redirecionamento automático** para o Dashboard com seu roadmap personalizado!

## Recursos Implementados

### Chat em Tempo Real ✅
- Streaming de respostas da OpenAI
- Indicador visual de digitação
- Auto-scroll
- Histórico persistente (localStorage)

### Geração de Roadmap ✅
- **Análise de Conversação**: Extrai perfil do usuário
- **Geração Estruturada**: Cria roadmap completo em JSON
- **Tasks Automáticas**:
  - Quizzes com perguntas
  - Desafios de código
  - Leituras
  - Vídeos
- **Layout Automático**: Posições calculadas com Dagre
- **Validação**: Detecta ciclos e referências inválidas

### Interface Completa ✅
- Badge "Gerado por IA" no Dashboard
- Botão de geração estilizado
- Estados de loading e erro
- Indicadores de progresso

## Arquitetura

```
ChatScreen (UI)
    ↓
aiService.streamChatResponse()
    ↓ (streaming em tempo real)
Resposta exibida ao usuário

[Botão "Gerar Roadmap" clicado]
    ↓
generateRoadmapFromChat()
    ↓
aiService.analyzeConversation() → ExtractedProfile
    ↓
aiService.generateRoadmap() → Roadmap completo
    ↓
Validação + Layout (Dagre)
    ↓
useLearningStore.setRoadmap()
    ↓
Dashboard exibe roadmap personalizado
```

## Arquivos Criados/Modificados

### Novos Arquivos:
- `src/services/aiService.ts` - Serviço de IA com streaming
- `src/utils/roadmapGenerator.ts` - Orquestrador de geração

### Arquivos Modificados:
- `.env` - API key da OpenAI
- `.env.example` - Template atualizado
- `src/store/useUserProfileStore.ts` - Campos de chat e IA
- `src/store/useLearningStore.ts` - Método setRoadmap
- `src/components/ChatScreen.tsx` - Streaming e botão de geração
- `src/components/Dashboard.tsx` - Badge "Gerado por IA"

## Prompts da IA

### Prompt 1: Análise de Conversação
Extrai do usuário:
- Learning Goal
- Target Role
- Current Level (beginner/intermediate/advanced)
- Interest Tags (tecnologias com score)
- Knowledge Gaps
- Desired Technologies

### Prompt 2: Geração de Roadmap
Cria roadmap com:
- Categorias relevantes (4-8)
- Nodes com tasks (20-40 total)
- Prerequisites inteligentes
- Multi-categoria
- Progressão de dificuldade
- Tasks variadas (quiz, coding, reading, video)

## Tipos de Tasks Geradas

### 1. Quiz
```json
{
  "type": "quiz",
  "content": {
    "questions": [
      {
        "question": "O que é React?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "..."
      }
    ]
  }
}
```

### 2. Desafio de Código
```json
{
  "type": "coding-challenge",
  "content": {
    "description": "Implemente FizzBuzz",
    "starterCode": "function fizzBuzz(n) { ... }",
    "testCases": [
      {
        "input": "fizzBuzz(5)",
        "expected": "Buzz",
        "description": "..."
      }
    ],
    "hints": ["Dica 1", "Dica 2"]
  }
}
```

### 3. Leitura
```json
{
  "type": "reading",
  "content": {
    "url": "https://...",
    "description": "...",
    "keyPoints": ["Ponto 1", "Ponto 2"]
  }
}
```

### 4. Vídeo
```json
{
  "type": "video-watch",
  "content": {
    "videoUrl": "https://youtube.com/...",
    "duration": "15min",
    "keyTopics": ["Tópico 1", "Tópico 2"]
  }
}
```

## Custos de API

### Modelo Usado: `gpt-4o-mini`
- Mais barato e rápido
- Perfeito para produção
- Gera roadmaps de qualidade

### Estimativa de Custos:
- Chat (streaming): ~$0.001 por mensagem
- Análise de conversação: ~$0.002
- Geração de roadmap: ~$0.005
- **Total por roadmap**: ~$0.01 USD

## Tratamento de Erros

✅ **API Key Inválida**: Mensagem clara ao usuário
✅ **JSON Inválido**: Retry automático e fallback
✅ **Prerequisites Circulares**: Detecção e remoção
✅ **Categorias Inválidas**: Correção automática
✅ **Tasks Faltando**: Geração de task default

## Validações Implementadas

1. **Estrutura do Roadmap**:
   - Campos obrigatórios
   - Arrays válidos
   - Mínimo de categorias e nodes

2. **Referências**:
   - Todos os prerequisites existem
   - Todos os categoryIds existem
   - Sem ciclos de dependência

3. **Tasks**:
   - Cada node tem pelo menos 1 task
   - nodeId correto em todas as tasks
   - Status e attempts inicializados

## Persistência

✅ **Histórico de Chat**: localStorage via Zustand
✅ **Roadmap Gerado**: localStorage via Zustand
✅ **Perfil do Usuário**: Atualizado com dados da IA
✅ **Data de Geração**: Rastreada para exibir badge

## Próximos Passos (Opcional)

### Melhorias Futuras:
1. **Regeneração Parcial**: Editar categorias específicas
2. **Múltiplos Roadmaps**: Histórico de versões
3. **Análise Contínua**: Ajustar roadmap com progresso
4. **Outros LLMs**: Claude 3.5, Gemini, Ollama

### Otimizações:
1. **Cache**: Evitar chamadas duplicadas
2. **Modelos Mais Baratos**: gpt-3.5-turbo para testes
3. **Limites**: 1 geração por sessão

## Testes Sugeridos

### Teste 1: Fluxo Básico
1. Abrir `/chat`
2. Enviar 3 mensagens sobre objetivos
3. Clicar em "Gerar Roadmap"
4. Verificar redirecionamento ao Dashboard
5. Ver badge "Gerado por IA"

### Teste 2: Streaming
1. Enviar mensagem
2. Ver texto aparecendo em tempo real
3. Cursor piscando durante digitação

### Teste 3: Erro de API Key
1. Remover API key do `.env`
2. Tentar enviar mensagem
3. Ver mensagem de erro clara

### Teste 4: Roadmap Completo
1. Gerar roadmap
2. Ir para `/learn`
3. Ver todos os nodes
4. Clicar em node
5. Ver aba "Exercícios"
6. Verificar tasks geradas

## Debug

### Logs no Console:
- "Analisando conversa..."
- "Perfil extraído: {...}"
- "Gerando roadmap personalizado..."
- "Roadmap gerado: {...}"

### LocalStorage:
- `user-profile-storage`: Histórico de chat
- `learning-storage`: Roadmap gerado

## Suporte

Para problemas:
1. Verificar console do navegador
2. Verificar API key no `.env`
3. Ver logs do terminal (npm run dev)

## Exemplo de Uso Completo

```
1. npm run dev
2. Login → Dashboard
3. "Conversar com IA"
4. "Quero aprender desenvolvimento web moderno"
5. "Sou iniciante, sei apenas HTML básico"
6. "Quero aprender React, TypeScript e Node.js"
7. [Botão aparece]
8. "Gerar Roadmap Personalizado"
9. [Aguardar ~10 segundos]
10. Dashboard com roadmap completo!
11. Ver categorias: HTML/CSS, JavaScript, React, Node.js...
12. Clicar em categoria → Ver lições
13. Clicar em lição → Ver exercícios
14. Fazer quiz → Ver resultado
15. Completar tarefas → Progresso salvo
```

---

**Status**: ✅ IMPLEMENTADO E FUNCIONANDO
**Build**: ✅ SUCESSO (669.86 KB)
**Testes**: Pronto para uso
**Custo**: ~$0.01 por roadmap gerado

Aproveite! 🚀
