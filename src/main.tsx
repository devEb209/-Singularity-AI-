import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './advanced.css'
import './account.css'
import './creative.css'
import './platform.css'
import './onboarding.css'
import './benchmark.css'
import './tool-ecosystem.css'
import './beta-real.css'
import './auth-real.css'
import './research-swarm.css'
import './capability-fabric.css'
import './divine-engine.css'
import './divine-os.css'
import App from './App'
import { ErrorBoundary } from './ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>,
)
