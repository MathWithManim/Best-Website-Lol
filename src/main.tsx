import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'

void initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <App />
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
)
