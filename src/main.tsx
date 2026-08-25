import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig, LazyMotion, domAnimation } from 'framer-motion'
import './index.css'
import App from './App.tsx'
import { initSentry } from './lib/sentry'

void initSentry()

console.log(
  '%cJasper Sona',
  'font: bold 28px "Special Elite", monospace; color: #e09f58; padding: 4px 0;',
  '\n poking around? respect. the whole site is a game -> /rng',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <App />
      </LazyMotion>
    </MotionConfig>
  </StrictMode>,
)
