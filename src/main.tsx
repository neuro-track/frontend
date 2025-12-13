import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from './lib/queryClient'
import './index.css'

const savedTheme = localStorage.getItem('theme-storage');
if (savedTheme) {
  try {
    const themeData = JSON.parse(savedTheme);
    if (themeData.state?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    console.error('Failed to parse theme data:', e);
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
