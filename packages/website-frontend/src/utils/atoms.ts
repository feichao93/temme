import { Record } from 'immutable'

export type AtomStatus = 'idle' | 'loading' | 'ready' | 'aborted'

const _AtomRecord = Record({ status: '', value: null })

export type AtomRecord<T> = Record<{ status: AtomStatus; value: T }> &
  Readonly<{ status: AtomStatus; value: T }>

export function AtomRecord<T>(props: { status: AtomStatus; value: T }) {
  return _AtomRecord(props) as AtomRecord<T>
}

AtomRecord.idle = function<T>(value: T) {
  return AtomRecord({ status: 'idle', value })
}
AtomRecord.loading = function<T>(value: T) {
  return AtomRecord({ status: 'loading', value })
}
AtomRecord.ready = function<T>(value: T) {
  return AtomRecord({ status: 'ready', value })
}
AtomRecord.aborted = function<T>(value: T) {
  return AtomRecord({ status: 'aborted', value })
}
