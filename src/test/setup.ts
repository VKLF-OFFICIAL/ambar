import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { MotionGlobalConfig } from 'framer-motion'

// Las animaciones no aportan nada en jsdom y retrasan las transiciones de salida.
MotionGlobalConfig.skipAnimations = true

afterEach(() => {
  cleanup()
  localStorage.clear()
})
