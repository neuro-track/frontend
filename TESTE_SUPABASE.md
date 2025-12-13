# Teste de Conexão Supabase - NeuroTrack

## ✅ Configuração Completa

Seu Supabase foi configurado com sucesso! Aqui estão os detalhes:

### Credenciais Configuradas
- **URL do Projeto**: `https://rmexzvlrzkmrokrkucyc.supabase.co`
- **Anon Key**: Configurada no arquivo `.env`
- **Status**: ✅ Habilitado (`VITE_ENABLE_SUPABASE=true`)

### Banco de Dados
- **Schema**: ✅ Instalado (7 tabelas criadas)
- **RLS (Row Level Security)**: ✅ Ativo em todas as tabelas
- **Triggers**: ✅ Configurados para updated_at
- **Indexes**: ✅ Criados para performance

## 🧪 Como Testar

### Passo 1: Verificar o Status Visual
1. Abra o aplicativo: http://localhost:3001/
2. Na página inicial (Dashboard), você verá um card de **Status do Supabase** no topo
3. Deve mostrar:
   - ✅ "Conectado com sucesso!"
   - Número de usuários registrados (provavelmente 0 se for primeira vez)

### Passo 2: Testar Criação de Conta
1. Clique em "Sair" se estiver logado
2. Clique em "Cadastrar"
3. Preencha:
   - Nome: Seu nome
   - Email: seu-email@exemplo.com
   - Senha: qualquer senha (mínimo 6 caracteres)
4. Clique em "Criar conta"

**O que acontece nos bastidores:**
- Supabase Auth cria o usuário
- Trigger automático cria o perfil na tabela `profiles`
- Dados são salvos no PostgreSQL

### Passo 3: Testar Sincronização de Notas
1. Depois de logar, vá para qualquer lição
2. Crie uma nota na aba "Anotações"
3. **Se Supabase estiver habilitado**: A nota é salva no banco de dados
4. **Teste de persistência**:
   - Limpe os dados do navegador (localStorage)
   - Faça login novamente
   - Suas notas devem estar lá!

### Passo 4: Verificar no Supabase Dashboard
1. Acesse: https://app.supabase.com
2. Selecione seu projeto (rmexzvlrzkmrokrkucyc)
3. Vá em **Table Editor**
4. Clique em `profiles` - deve ver seu usuário criado
5. Clique em `notes` - deve ver as notas que você criou

## 🔍 Verificações Técnicas

### Console do Navegador
Abra o DevTools (F12) e verifique:

```javascript
// Verificar se Supabase está habilitado
console.log('Supabase enabled:', import.meta.env.VITE_ENABLE_SUPABASE);

// Verificar URL
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Testar conexão manualmente
import { supabase } from './lib/supabase';
const { data, error } = await supabase.from('profiles').select('count');
console.log('Connection test:', data, error);
```

### Logs do Supabase
1. Acesse: https://app.supabase.com/project/rmexzvlrzkmrokrkucyc/logs/explorer
2. Você verá todas as queries sendo executadas
3. Útil para debug

## 🐛 Troubleshooting

### Erro: "Supabase não está habilitado"
**Solução**: Verifique se `VITE_ENABLE_SUPABASE=true` no `.env` e reinicie o servidor

### Erro: "Invalid API key"
**Solução**:
1. Vá em Supabase Dashboard → Settings → API
2. Copie novamente a **anon (public)** key
3. Atualize no `.env`
4. Reinicie o servidor

### Erro: "relation 'profiles' does not exist"
**Solução**:
1. Vá em SQL Editor no Supabase
2. Execute o arquivo `supabase-schema.sql` completo
3. Verifique se todas as 7 tabelas foram criadas

### Erro: "Row Level Security policy violation"
**Solução**:
1. Verifique se você está autenticado (logado)
2. Verifique se as políticas RLS foram criadas corretamente
3. No SQL Editor, execute:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
4. Deve retornar várias políticas

### Notas não aparecem após login
**Possíveis causas**:
1. Supabase está desabilitado (usando localStorage)
2. Você criou as notas antes de habilitar o Supabase
3. As notas estão em outro usuário

**Solução**: Vá em `/notes` e veja todas as notas. Se não houver nada, crie uma nova.

## 📊 Estrutura do Banco de Dados

```
┌─────────────────┐
│   auth.users    │  (Gerenciado pelo Supabase Auth)
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
┌────────▼────────┐                  ┌─────────▼─────────┐
│    profiles     │                  │   roadmaps        │
│  (Perfil user)  │                  │ (AI roadmaps)     │
└─────────────────┘                  └───────────────────┘
         │                                     │
         ├─────────────┬──────────┬────────────┤
         │             │          │            │
┌────────▼────┐ ┌──────▼─────┐ ┌─▼──────┐ ┌──▼────────────┐
│    notes    │ │ favorites  │ │  chat  │ │node_progress  │
│ (Anotações) │ │ (Favoritos)│ │messages│ │task_completions│
└─────────────┘ └────────────┘ └────────┘ └───────────────┘
```

## 🚀 Próximos Passos

Agora que o Supabase está funcionando, você pode:

1. ✅ **Criar conta e fazer login** - Autenticação real
2. ✅ **Criar notas** - Salvas no banco de dados
3. ✅ **Gerar roadmap com IA** - Salvo no Supabase
4. ✅ **Acessar de qualquer dispositivo** - Multi-device sync
5. ⏳ **Implementar perfil editável** (Phase 4)
6. ⏳ **Visualização de grafo livre** (Phase 5)

## 📝 Notas Importantes

- **Senha do PostgreSQL**: `Okaeri314*` - Use apenas para conexões administrativas diretas
- **Anon Key**: Configurada no `.env` - Use para todas as operações do frontend
- **RLS**: Todas as tabelas têm Row Level Security - usuários só veem seus próprios dados
- **Backup**: Habilite backups automáticos em Supabase Dashboard → Database → Backups

## ✨ Features Habilitadas

Com o Supabase funcionando, você agora tem:

- ✅ **Autenticação real** com email/senha
- ✅ **Persistência de dados** no PostgreSQL
- ✅ **Multi-device sync** - acesse de qualquer lugar
- ✅ **Segurança** com RLS e políticas
- ✅ **Escalabilidade** - suporta milhares de usuários
- ✅ **Offline fallback** - se Supabase estiver offline, usa localStorage

Aproveite! 🎉
