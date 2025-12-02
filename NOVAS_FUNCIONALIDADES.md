# Novas Funcionalidades - NeuroTrack

Este documento descreve as novas funcionalidades adicionadas à plataforma NeuroTrack.

## 1. Sistema de Notificações

**Localização**: Ícone de sino na barra de navegação

### Características:
- Notificações em tempo real para conquistas, recomendações e marcos
- Contador de notificações não lidas
- Marcar como lida individual ou todas de uma vez
- Navegação direta ao clicar em uma notificação
- Suporte para 5 tipos de notificações:
  - `achievement`: Conquistas desbloqueadas
  - `recommendation`: Recomendações personalizadas
  - `reminder`: Lembretes de estudo
  - `milestone`: Marcos alcançados
  - `social`: Interações sociais

### Como usar:
```typescript
import { useNotificationStore } from './store/useNotificationStore';

const { addNotification } = useNotificationStore();

// Adicionar notificação
addNotification({
  userId: 'user123',
  type: 'achievement',
  title: 'Nova Conquista!',
  message: 'Você completou 10 lições',
  icon: '🏆',
  link: '/achievements'
});
```

## 2. Sistema de Pesquisa

**Atalho**: Ícone de lupa na barra de navegação ou `Ctrl/Cmd + K`

### Características:
- Busca em tempo real por cursos, lições e tags
- Resultados agrupados por tipo (curso ou lição)
- Badges de dificuldade nas lições
- Navegação direta aos resultados
- Interface modal com design moderno

### Busca por:
- Título de cursos
- Descrição de cursos
- Título de lições
- Descrição de lições
- Tags associadas

## 3. Sistema de Favoritos

**Localização**: Ícone de coração na barra de navegação → Página `/favorites`

### Características:
- Marcar cursos e lições como favoritos
- Visualização organizada por tipo
- Acesso rápido aos favoritos
- Remoção fácil de itens
- Persistência local (localStorage)

### Como usar:
```typescript
import { useFavoritesStore } from './store/useFavoritesStore';

const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();

// Adicionar aos favoritos
addFavorite('course-id', 'course', 'user-id');

// Verificar se é favorito
const isFav = isFavorite('course-id');

// Remover dos favoritos
removeFavorite('favorite-id');
```

## 4. Modo Escuro/Claro

**Localização**: Ícone de lua/sol na barra de navegação

### Características:
- Toggle entre tema claro e escuro
- Persistência da preferência do usuário
- Aplicação automática em toda a interface
- Suporte completo em todos os componentes
- Transições suaves

### Como usar:
```typescript
import { useThemeStore } from './store/useThemeStore';

const { theme, toggleTheme, setTheme } = useThemeStore();

// Alternar tema
toggleTheme();

// Definir tema específico
setTheme('dark');
```

## 5. Sistema de Notas

**Localização**: Painel nas páginas de lição

### Características:
- Criar, editar e excluir anotações
- Anotações vinculadas a lições específicas
- Timestamps de criação e atualização
- Interface rica em texto
- Persistência local

### Como usar:
```typescript
import { useNotesStore } from './store/useNotesStore';

const { addNote, updateNote, deleteNote, getNotesByNode } = useNotesStore();

// Adicionar nota
addNote({
  userId: 'user123',
  nodeId: 'lesson-id',
  courseId: 'course-id',
  content: 'Minha anotação importante'
});

// Obter notas de uma lição
const notes = getNotesByNode('lesson-id');

// Atualizar nota
updateNote('note-id', 'Novo conteúdo');

// Deletar nota
deleteNote('note-id');
```

## 6. Navegação Melhorada

**Localização**: Barra superior em todas as páginas

### Características:
- Design moderno e responsivo
- Acesso rápido a todas as funcionalidades
- Badge de favoritos
- Badge de notificações não lidas
- Menu de perfil integrado
- Botão de logout visível

### Links principais:
- Dashboard
- Cursos
- Chat
- Busca
- Favoritos
- Notificações
- Perfil

## Integração com Componentes Existentes

### Adicionar NotesPanel a uma lição:
```tsx
import { NotesPanel } from './components/NotesPanel';

<NotesPanel nodeId={nodeId} courseId={courseId} />
```

### Adicionar Navbar a uma página:
```tsx
import { Navbar } from './components/Navbar';

<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
  <Navbar />
  {/* Seu conteúdo aqui */}
</div>
```

## Stores e Estado

Todos os novos stores utilizam Zustand e alguns incluem persistência automática:

- `useNotificationStore`: Estado em memória (resetado ao recarregar)
- `useThemeStore`: Persistido (localStorage)
- `useNotesStore`: Persistido (localStorage)
- `useFavoritesStore`: Persistido (localStorage)

## Suporte ao Dark Mode

Para garantir que seus componentes suportem dark mode, use as classes do Tailwind:

```tsx
// Exemplo
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Conteúdo
</div>
```

## Próximos Passos Sugeridos

1. Integrar com backend real (substituir localStorage por API calls)
2. Adicionar sincronização entre dispositivos
3. Implementar notificações push
4. Adicionar exportação de notas
5. Criar sistema de compartilhamento de favoritos
6. Adicionar pesquisa avançada com filtros
7. Implementar atalhos de teclado globais

## Tecnologias Utilizadas

- **Zustand**: Gerenciamento de estado
- **Zustand Middleware (persist)**: Persistência local
- **Tailwind CSS**: Estilização com suporte a dark mode
- **Lucide React**: Ícones
- **date-fns**: Formatação de datas
- **React Router**: Navegação

## Suporte

Para questões ou problemas, consulte:
- README.md principal
- Documentação inline no código
- Issues no GitHub
