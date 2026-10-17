import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces'
import './styles/theme.css'
import './lib/install'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { InstallBanner } from './components/InstallBanner'

const root = document.getElementById('root')
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
        <InstallBanner />
      </ErrorBoundary>
    </StrictMode>,
  )
}
