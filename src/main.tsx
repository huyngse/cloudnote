import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Heliodor from './pages/Heliodor'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Heliodor />
  </StrictMode>,
)
