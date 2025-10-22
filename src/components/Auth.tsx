import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { BookOpen, Mail } from 'lucide-react';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, 'demo');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Mock social login
    login(`user@${provider}.com`, 'demo');
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
          <p className="text-sm text-gray-600">Personalized learning platform</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.438 15.983 5.482 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.482 0 2.438 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin('apple')}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-900 rounded-lg text-white font-medium hover:bg-gray-800 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <path d="M14.617 12.667c-.32.713-.473 1.033-.886 1.663-.576.88-1.388 1.973-2.393 1.983-.893.01-1.126-.577-2.345-.571-1.22.006-1.476.582-2.37.571-1.004-.01-1.765-1.003-2.341-1.883-1.615-2.465-1.786-5.36-.788-6.9.712-1.096 1.835-1.74 2.876-1.74 1.07 0 1.742.582 2.627.582.858 0 1.381-.583 2.617-.583.934 0 1.933.508 2.643 1.388-2.323 1.275-1.947 4.594.36 5.49zm-2.91-8.644c.45-.58.797-1.39.672-2.2-.727.047-1.587.515-2.094 1.146-.456.566-.835 1.388-.69 2.177.796.024 1.607-.454 2.112-1.123z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">or</span>
          </div>
        </div>

        {/* Email Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all text-sm"
                placeholder="your.email@example.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Sign In
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10m0 0l-4-4m4 4l-4 4"/>
            </svg>
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          New here?{' '}
          <button className="text-gray-900 font-medium hover:underline">
            Create account
          </button>
        </p>

        <p className="text-center text-xs text-gray-500 mt-8">
          By continuing, you agree to our{' '}
          <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};
