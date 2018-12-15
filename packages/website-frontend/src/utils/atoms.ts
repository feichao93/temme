export type AtomStatus = 'loading' | 'ready' // TODO ?? aborted

export type Atom<T> = { status: AtomStatus; value: T }

export function atomReady<T>(value: T): Atom<T> {
  return { status: 'ready', value }
}
