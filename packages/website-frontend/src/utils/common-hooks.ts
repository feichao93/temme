import { useEffect, EffectCallback, useLayoutEffect } from 'react'

export function useDidMount(effect: EffectCallback) {
  return useEffect(effect, [])
}

export function useBodyOverflowHidden() {
  return useLayoutEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = '')
  }, [])
}
