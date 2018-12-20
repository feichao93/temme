import { useEffect, EffectCallback, useLayoutEffect } from 'react'

export function useDidMount(effect: EffectCallback) {
  return useEffect(effect, [])
}

export function useWillUnmount(teardownLogic: () => void) {
  return useEffect(() => teardownLogic, [])
}

export function useBodyOverflowHidden() {
  return useLayoutEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => (document.body.style.overflow = '')
  }, [])
}
