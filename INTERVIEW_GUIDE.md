# Sistema de Entrevista Guiada - Geração de Roadmap com IA

## Novas Funcionalidades Implementadas ✅

### 1. Sistema de Entrevista Guiada
O chat agora oferece **duas formas** de gerar um roadmap personalizado:

#### Modo 1: Entrevista Guiada (Recomendado) 🎯
- **6 perguntas estruturadas** para coletar informações completas
- Processo **rápido e objetivo** (2-3 minutos)
- Garante que **todas as informações necessárias** sejam coletadas
- Ideal para quem quer ir direto ao ponto

#### Modo 2: Conversa Livre 💬
- **Chat aberto** com streaming em tempo real
- Usuário conta livremente sobre seus objetivos
- Mais **natural e exploratório**
- Ideal para quem quer explorar ideias antes de decidir

### 2. Roadmap Exclusivo em /learn
- `/learn` agora mostra **APENAS o roadmap gerado** (não mais os cursos legados)
- Interface limpa focada no conteúdo personalizado
- Filtros removidos quando há roadmap ativo

---

## Fluxo Completo: Entrevista Guiada

### Passo 1: Escolha do Modo
Ao abrir `/chat`, o usuário vê:

```
Olá! Sou seu assistente de aprendizado com IA.

Vou criar um roadmap personalizado para você! Posso fazer de duas formas:

1️⃣ Entrevista Guiada - Faço 6 perguntas rápidas para entender seus objetivos
2️⃣ Conversa Livre - Você me conta tudo livremente e conversamos

Qual você prefere?
```

**Botões visuais:**
- [1] **Entrevista Guiada** (destaque azul/roxo)
  - "Responda 6 perguntas rápidas e diretas"
  - "✨ Recomendado - Mais rápido e objetivo"

- [2] **Conversa Livre** (branco/cinza)
  - "Converse naturalmente comigo sobre seus objetivos"
  - "💬 Ideal para explorar ideias"

### Passo 2: As 6 Perguntas

Se escolher **Entrevista Guiada**, o sistema faz:

**Pergunta 1/6:**
*Qual é seu principal objetivo de aprendizado?*

💡 Exemplos:
• Me tornar desenvolvedor full stack
• Aprender ciência de dados
• Dominar design de interfaces

---

**Pergunta 2/6:**
*Qual cargo ou papel você almeja?*

💡 Exemplos:
• Desenvolvedor Full Stack
• Data Scientist
• UX/UI Designer

---

**Pergunta 3/6:**
*Qual seu nível de experiência atual na área?*

💡 Exemplos:
• Iniciante - nunca programei
• Intermediário - já fiz alguns projetos
• Avançado - trabalho na área

---

**Pergunta 4/6:**
*Quais tecnologias ou habilidades você quer aprender especificamente?*

💡 Exemplos:
• React, TypeScript, Node.js
• Python, pandas, machine learning
• Figma, design systems, acessibilidade

---

**Pergunta 5/6:**
*Quantas horas por semana você pode dedicar aos estudos?*

💡 Exemplos:
• 5-10 horas
• 10-20 horas
• 20+ horas

---

**Pergunta 6/6:**
*O que você já sabe ou já estudou relacionado a isso?*

💡 Exemplos:
• HTML e CSS básico
• Python básico
• Nunca estudei nada relacionado

### Passo 3: Mensagem de Conclusão

Após responder todas as perguntas:

```
Excelente! 🎉

Coletei todas as informações necessárias. Agora posso gerar um roadmap
completamente personalizado para você com:

✅ Lições adaptadas ao seu nível
✅ Tecnologias que você quer aprender
✅ Ritmo baseado no seu tempo disponível
✅ Exercícios práticos em cada etapa

[Botão aparece: Gerar Roadmap Personalizado]
```

### Passo 4: Geração do Roadmap

Ao clicar no botão:

1. **Loading state** com mensagem:
   ```
   Gerando seu roadmap personalizado...

   Analisando seus objetivos e criando um caminho de aprendizado
   completo com lições e exercícios. Isso pode levar alguns instantes.
   ```

2. **IA processa** (~10-15 segundos):
   - Analisa todas as 6 respostas
   - Extrai perfil completo do usuário
   - Gera roadmap com 20-40 lições
   - Cria 2-4 tarefas por lição
   - Calcula posições com Dagre

3. **Redirecionamento automático** para `/dashboard`

### Passo 5: Dashboard com Roadmap

```
[Badge Roxo/Azul]
🌟 Roadmap Personalizado por IA
Gerado em 04 de dezembro de 2025, 15:30
```

**Roadmap completo exibido:**
- Categorias baseadas nas tecnologias escolhidas
- Lições progressivas (beginner → advanced)
- Prerequisites inteligentes
- Multi-categoria funcionando

### Passo 6: Visualizar em /learn

Ao ir para `/learn`:
- **APENAS o roadmap gerado** é mostrado
- Cursos legados não aparecem mais
- Interface limpa e focada
- Grafo completo com todas as lições

---

## Exemplo de Entrevista Completa

### Contexto:
Usuário quer aprender desenvolvimento full stack, é iniciante.

### Conversa:

**Bot:** Olá! Sou seu assistente... Qual você prefere?

**User:** [Clica em "Entrevista Guiada"]

**Bot:** Ótimo! Vou fazer 6 perguntas...
**Pergunta 1/6:** Qual é seu principal objetivo de aprendizado?

**User:** Quero me tornar desenvolvedor full stack

**Bot:** Perfeito! 👍
**Pergunta 2/6:** Qual cargo ou papel você almeja?

**User:** Desenvolvedor Full Stack

**Bot:** Perfeito! 👍
**Pergunta 3/6:** Qual seu nível de experiência atual?

**User:** Sou iniciante, nunca programei

**Bot:** Perfeito! 👍
**Pergunta 4/6:** Quais tecnologias você quer aprender?

**User:** HTML, CSS, JavaScript, React, Node.js

**Bot:** Perfeito! 👍
**Pergunta 5/6:** Quantas horas por semana você pode dedicar?

**User:** 10-15 horas

**Bot:** Perfeito! 👍
**Pergunta 6/6:** O que você já sabe?

**User:** Nunca estudei programação antes

**Bot:** Excelente! 🎉
Coletei todas as informações... [botão aparece]

**User:** [Clica em "Gerar Roadmap"]

**Bot:** [Loading...] Gerando seu roadmap personalizado...

**[Após 10 segundos]** → Redirecionado para `/dashboard`

**Dashboard mostra:**
- Badge "Roadmap Personalizado por IA"
- Categorias: HTML/CSS, JavaScript, React, Node.js, Full Stack
- 30+ lições progressivas
- Exercícios em cada lição

---

## Vantagens do Sistema de Entrevista

### ✅ Coleta Completa de Dados
- Garante que **nenhuma informação importante** seja esquecida
- Estrutura padronizada facilita a análise pela IA

### ✅ Experiência Guiada
- Usuário não precisa pensar "o que dizer"
- Exemplos ajudam a formular respostas
- Processo rápido e direto

### ✅ Melhor Qualidade do Roadmap
- IA tem **todas as informações necessárias**
- Roadmap mais preciso e personalizado
- Menos chance de gerar conteúdo genérico

### ✅ Flexibilidade
- Ainda oferece **Conversa Livre** para quem prefere
- Usuário escolhe o modo que prefere

---

## Comparação: Entrevista vs Conversa Livre

| Aspecto | Entrevista Guiada | Conversa Livre |
|---------|-------------------|----------------|
| **Tempo** | 2-3 minutos | 5-10 minutos |
| **Estrutura** | 6 perguntas fixas | Aberta |
| **Streaming** | Não (respostas instantâneas) | Sim (tempo real) |
| **Custo API** | Baixo (análise única) | Médio (múltiplas chamadas) |
| **Qualidade** | Consistente | Variável |
| **Recomendado para** | Maioria dos usuários | Exploração/indecisão |

---

## Mudanças Técnicas

### ChatScreen.tsx

**Novos estados:**
```typescript
const [interviewStep, setInterviewStep] = useState(0);
const [isInterviewMode, setIsInterviewMode] = useState(false);
```

**Novas funções:**
- `startInterview()` - Inicia modo entrevista
- `handleInterviewAnswer()` - Processa respostas e avança perguntas
- Lógica de detecção de modo (entrevista vs livre)

**Nova UI:**
- Botões de seleção de modo (visual atraente)
- Progresso da entrevista (Pergunta X/6)
- Exemplos em cada pergunta
- Mensagem de conclusão com checklist

### UnifiedLearningGraph.tsx

**Mudança principal:**
```typescript
// ANTES: Mostrava roadmap + cursos legados
const courseIds = courses.map(c => c.id);
return roadmap ? [roadmap.id, ...courseIds] : courseIds;

// AGORA: Mostra APENAS roadmap se existir
if (roadmap) {
  return [roadmap.id]; // Somente roadmap
} else {
  return courses.map(c => c.id); // Cursos legados como fallback
}
```

**Filtros:**
- Removidos quando há roadmap gerado
- Aparecem apenas para cursos legados (fallback)

---

## Critérios de Geração do Roadmap

Com as 6 perguntas, a IA tem:

1. **Objetivo claro** (Pergunta 1)
2. **Cargo alvo** (Pergunta 2)
3. **Nível atual** (Pergunta 3) → Define dificuldade inicial
4. **Tecnologias específicas** (Pergunta 4) → Define categorias
5. **Tempo disponível** (Pergunta 5) → Ajusta quantidade de conteúdo
6. **Conhecimento prévio** (Pergunta 6) → Define ponto de partida

**Resultado:** Roadmap altamente personalizado!

---

## Status Final

- ✅ **Entrevista Guiada**: Implementada e funcional
- ✅ **Conversa Livre**: Mantida como opção
- ✅ **Botões de Escolha**: Design atraente com destaque
- ✅ **Progresso Visual**: Pergunta X/6 com exemplos
- ✅ **/learn Exclusivo**: Mostra apenas roadmap gerado
- ✅ **Build**: Sucesso (673.14 KB)

---

## Como Testar

1. **Limpar localStorage** (se já usou antes)
2. **Ir para `/chat`**
3. **Escolher "Entrevista Guiada"**
4. **Responder as 6 perguntas**
5. **Clicar em "Gerar Roadmap"**
6. **Ver Dashboard com roadmap**
7. **Ir para `/learn`** → Ver apenas roadmap gerado

---

**Tudo pronto! O sistema agora oferece uma experiência guiada profissional!** 🎉
