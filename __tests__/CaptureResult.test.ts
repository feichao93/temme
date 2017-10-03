import { CaptureResult } from '../src/index'

test('get null from empty CaptureResult instance', () => {
  const emptyCaptureResult = new CaptureResult({})
  expect(emptyCaptureResult.get()).toBe(null)
})

test('get values from a simple CaptureResult instance', () => {
  const r = new CaptureResult({})
  r.add('key-1', 'value-1')
  r.add('key-2', 'value-2')
  r.add('key-3', 'value-3')
  expect(r.get()).toEqual({
    'key-1': 'value-1',
    'key-2': 'value-2',
    'key-3': 'value-3',
  })
})

test('when not force, it should ignore null or undefined', () => {
  const r = new CaptureResult({})
  r.add('k1', null)
  r.add('k2', undefined)
  expect(r.get()).toEqual(null)

  r.add('k3', 111)
  expect(r.get()).toEqual({ k3: 111 })

  r.add('k4', null)
  expect(r.get()).toEqual({ k3: 111 })
})

test('force add', () => {
  const r = new CaptureResult({})
  r.add('k1', null, null, false)
  r.add('k2', null, null, true)
  expect(r.get()).toEqual({ k2: null })
})

test('fail a CaptureResult', () => {
  const r = new CaptureResult({})
  r.add('k1', null)
  r.add('k2', null, null, true)
  r.add('k3', 'v3')

  expect(r.get()).toEqual({
    k2: null,
    k3: 'v3',
  })

  expect(r.isFailed()).toBe(false)
  r.setFailed()
  expect(r.isFailed()).toBe(true)
  expect(r.get()).toBe(null)

  r.add('k4', 'v4')
  r.add('k5', 'v5')
  expect(r.isFailed()).toBe(true)
  expect(r.get()).toBe(null)
})

test('merge CaptureResult', () => {
  const a = new CaptureResult({})
  a.add('a1', 'v1')
  a.add('a2', 'v2')

  const b = new CaptureResult({})
  b.add('b1', 'w1')
  b.add('b2', 'w2')

  expect(a.get()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })

  a.merge(b)
  expect(a.get()).toEqual({
    a1: 'v1',
    a2: 'v2',
    b1: 'w1',
    b2: 'w2',
  })
})

test('merge propagrates capture-failure', () => {
  const a = new CaptureResult({})
  a.add('a1', 'v1')
  a.add('a2', 'v2')

  const b = new CaptureResult({})
  b.setFailed()

  expect(a.get()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })

  a.merge(b)
  expect(a.isFailed()).toBe(true)
})
