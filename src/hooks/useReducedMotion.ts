import { useEffect, useState } from 'react'
import { useAddictionStore } from '../store/useAddictionStore'

const QUERY = '(prefers-reduced-motion: reduce)'

export function useReducedMotion(): boolean {
  const forced = useAddictionStore((s) => s.settings.reduceMotion)
  const [system, setSystem] = useState(() => typeof matchMedia === 'function' && matchMedia(QUERY).matches)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const mq = matchMedia(QUERY)
    const onChange = () => setSystem(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return forced || system
}
