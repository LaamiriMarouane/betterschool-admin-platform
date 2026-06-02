import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import '@/lib/i18n'
import App from './App.tsx'
import { ThemeProvider } from '@/providers/theme.provider'
import { Toaster } from '@/components/ui/toaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </StrictMode>,
)
