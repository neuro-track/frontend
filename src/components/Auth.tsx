import { useAuthStore } from '../store/useAuthStore';
import { BookOpen } from 'lucide-react';

export const Auth = () => {
  const { fetchUserFromApi } = useAuthStore();

  const handleGoogleLogin = async () => {

  const apiBase = ((import.meta as any).env?.VITE_API_URL as string) || 'http://localhost:3000';
    const redirectTo = window.location.origin; // after successful auth backend will redirect here
    const oauthUrl = `${apiBase}/api/v1/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`;

    const popup = window.open(oauthUrl, 'oauth', 'width=600,height=700');
    if (!popup) {
      console.error('Popup blocked');
      return;
    }

    try {
      const maxAttempts = 120; // ~2 minutes
      for (let i = 0; i < maxAttempts; i++) {
        // wait 1s
        await new Promise((r) => setTimeout(r, 1000));

        // If popup closed by user, stop polling
        if (popup.closed) break;

        try {
          const res = await fetch(`${apiBase}/api/v1/status`, { credentials: 'include' });
          if (res.ok) {
            const data = await res.json();
            if (data.authenticated) {
              // sync user info and close popup
              await fetchUserFromApi();
              try { popup.close(); } catch (e) {}
              return;
            }
          }
        } catch (err) {
          // ignore transient fetch errors
        }
      }
    } finally {
      if (!popup.closed) {
        try { popup.close(); } catch (e) {}
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo and branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-xl mb-4">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Neuro Track</h1>
          <p className="text-sm text-gray-600">Plataforma de aprendizagem personalizada</p>
        </div>

        {/* Botão de Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <p className="text-center text-xs text-gray-500 mt-8">
          Ao continuar, você concorda com nossos{' '}
          <a href="#" className="underline hover:text-gray-700">Termos de Serviço</a>
          {' '}e{' '}
          <a href="#" className="underline hover:text-gray-700">Política de Privacidade</a>
        </p>
      </div>
    </div>
  );
};
