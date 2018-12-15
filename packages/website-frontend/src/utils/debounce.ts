export default function debounce(fn: () => void, timeout: number) {
  let scheduled = false
  let t = 0
  let handle: any = null

  return function debounced() {
    const now = performance.now()
    if (!scheduled || now - t < timeout) {
      clearTimeout(handle)
      handle = setTimeout(() => {
        scheduled = false
        fn()
      }, timeout)
      scheduled = true
      t = now
    }

    return () => clearTimeout(handle)
  }
}
