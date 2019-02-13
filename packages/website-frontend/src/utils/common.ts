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

export function fromNow(date: string) {
  const msDelta = (new Date().valueOf() - new Date(date).valueOf()) / 1000
  if (msDelta > 3600 * 24) {
    return `${Math.floor(msDelta / 3600 / 24)}天`
  } else if (msDelta > 3600) {
    return `${Math.floor(msDelta / 3600)}小时`
  } else if (msDelta > 60) {
    return `${Math.floor(msDelta / 60)}分钟`
  } else {
    return '几秒'
  }
}
