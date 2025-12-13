/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ENABLE_YOUTUBE: string;
  readonly VITE_ENABLE_WIKIPEDIA: string;
  readonly VITE_ENABLE_AI_ROADMAP: string;
  readonly VITE_ENABLE_SUPABASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
