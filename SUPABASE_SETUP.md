# Supabase Setup Guide for NeuroTrack

This guide will help you set up Supabase as the backend for NeuroTrack, enabling real data persistence, authentication, and multi-device sync.

## Prerequisites

- A Supabase account (free tier available at [supabase.com](https://supabase.com))
- Node.js and npm installed
- This project cloned and dependencies installed

## Step 1: Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the project details:
   - **Name**: NeuroTrack (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select the closest region to your users
4. Click "Create new project" and wait for setup to complete (2-3 minutes)

## Step 2: Run the Database Schema

1. In your Supabase project dashboard, click on "SQL Editor" in the left sidebar
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

This will create:
- 7 database tables (profiles, roadmaps, notes, node_progress, task_completions, favorites, chat_messages)
- Row Level Security policies (users can only access their own data)
- Indexes for performance
- Automatic triggers for timestamps
- Auto-create profile on user signup

## Step 3: Configure Environment Variables

1. In your Supabase dashboard, go to "Project Settings" (gear icon) → "API"
2. Copy the following values:
   - **Project URL**: Under "Project URL"
   - **Anon (public) key**: Under "Project API keys" → "anon public"

3. Create or update your `.env` file in the project root:

```bash
# Copy .env.example to .env
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Enable Supabase
VITE_ENABLE_SUPABASE=true
```

**Important**: Never commit your `.env` file to Git! It should already be in `.gitignore`.

## Step 4: Enable Email Authentication

1. In Supabase dashboard, go to "Authentication" → "Providers"
2. Enable "Email" provider (should be enabled by default)
3. (Optional) Configure email templates:
   - Go to "Authentication" → "Email Templates"
   - Customize confirmation and password reset emails

## Step 5: Test the Setup

1. Start your development server:

```bash
npm run dev
```

2. Navigate to the app (usually http://localhost:5173)
3. Try signing up with a new account
4. Check the Supabase dashboard under "Authentication" → "Users" to see your new user
5. Create a note and check "Table Editor" → "notes" to see it in the database

## Step 6: Data Migration (Optional)

If you have existing data in localStorage that you want to migrate to Supabase:

1. Make sure you're logged in to the app
2. Open browser DevTools → Console
3. Run the migration script (to be implemented):

```javascript
// This will export localStorage data to Supabase
await migrateToSupabase();
```

## Features Enabled by Supabase

### ✅ Real Authentication
- Secure email/password authentication
- Password reset functionality
- Session management

### ✅ Data Persistence
- All data saved to PostgreSQL database
- Survives browser cache clears
- No more lost progress!

### ✅ Multi-Device Sync
- Access your data from any device
- Real-time updates (planned)
- Seamless sync across sessions

### ✅ Offline Fallback
- When Supabase is disabled (`VITE_ENABLE_SUPABASE=false`), app falls back to localStorage
- No internet? App still works offline

### ✅ Data Security
- Row Level Security ensures users can only access their own data
- Passwords hashed with bcrypt
- Automatic SQL injection protection

## Troubleshooting

### "Invalid API key" error
- Double-check your `VITE_SUPABASE_ANON_KEY` in `.env`
- Make sure you copied the **anon (public)** key, not the service role key
- Restart your dev server after changing `.env`

### Schema errors
- Make sure you ran the ENTIRE `supabase-schema.sql` file
- Check the SQL Editor for error messages
- Drop existing tables if you need to start fresh:
  ```sql
  DROP TABLE IF EXISTS chat_messages, favorites, task_completions, node_progress, notes, roadmaps, profiles CASCADE;
  ```

### User can't see their data
- Check that Row Level Security is enabled
- Verify the user is authenticated (check browser DevTools → Application → Cookies)
- Check Supabase logs: Dashboard → Logs → "Show query performance"

### Notes not syncing
- Enable Supabase: Set `VITE_ENABLE_SUPABASE=true` in `.env`
- Check browser console for errors
- Verify your Supabase URL is correct

## Advanced Configuration

### Custom Domain (Production)

For production, you can set up a custom domain:

1. Go to "Project Settings" → "Custom Domains"
2. Follow the instructions to add your domain
3. Update `VITE_SUPABASE_URL` to use your custom domain

### Real-time Subscriptions (Future Enhancement)

To enable real-time updates:

```typescript
// Subscribe to notes changes
supabase
  .channel('notes-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'notes' },
    (payload) => {
      console.log('Note changed:', payload);
      // Update UI
    }
  )
  .subscribe();
```

### Backup & Export

To backup your data:

1. Go to "Database" → "Backups" in Supabase dashboard
2. Daily backups are automatic on Pro plan
3. For manual export: "Database" → "Backups" → "Download"

## Database Schema Overview

```
profiles (user account info)
├── roadmaps (AI-generated learning paths)
│   └── node_progress (individual lesson progress)
│       └── task_completions (quiz scores, submissions)
├── notes (global Notion-style notes)
├── favorites (starred courses/lessons)
└── chat_messages (AI conversation history)
```

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: [GitHub Issues](your-repo-url)

## Next Steps

Once Supabase is set up:

1. ✅ Create your learning roadmap with AI
2. ✅ Take notes on your lessons
3. ✅ Track your progress across devices
4. ✅ Never lose your data again!

Happy learning! 🚀
