import { useState, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { CheckCircle, XCircle, Loader, Database } from 'lucide-react';

export function SupabaseTest() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userCount, setUserCount] = useState<number | null>(null);

  useEffect(() => {
    async function testConnection() {
      if (!isSupabaseEnabled || !supabase) {
        setStatus('error');
        setErrorMessage('Supabase não está habilitado ou configurado');
        return;
      }

      try {
        // Test 1: Check auth status
        const { error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        // Test 2: Try to query profiles table (this will work even if no user is logged in)
        const { error, count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) {
          console.error('Database error:', error);
          setStatus('error');
          setErrorMessage(`Erro ao conectar: ${error.message}`);
          return;
        }

        setStatus('connected');
        setUserCount(count || 0);
      } catch (err) {
        console.error('Connection test failed:', err);
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }

    testConnection();
  }, []);

  if (!isSupabaseEnabled) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
              Supabase Desabilitado
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Configure VITE_ENABLE_SUPABASE=true no arquivo .env
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Status do Supabase
        </h3>
      </div>

      {status === 'checking' && (
        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
          <Loader className="w-5 h-5 animate-spin" />
          <span>Testando conexão...</span>
        </div>
      )}

      {status === 'connected' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Conectado com sucesso!</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>✓ Supabase client inicializado</p>
            <p>✓ Conexão com banco de dados estabelecida</p>
            <p>✓ Schema instalado corretamente</p>
            {userCount !== null && (
              <p className="mt-2">
                📊 Usuários registrados: <span className="font-semibold">{userCount}</span>
              </p>
            )}
          </div>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              🎉 Você pode começar a usar o sistema! Crie uma conta ou faça login para sincronizar seus dados.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Erro na conexão</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
          </div>
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
            <p className="text-sm text-red-800 dark:text-red-200 mb-2">
              Verifique:
            </p>
            <ul className="text-sm text-red-700 dark:text-red-300 list-disc list-inside space-y-1">
              <li>VITE_SUPABASE_URL está correto</li>
              <li>VITE_SUPABASE_ANON_KEY está correto</li>
              <li>O schema foi executado no SQL Editor</li>
              <li>As políticas RLS estão ativas</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
