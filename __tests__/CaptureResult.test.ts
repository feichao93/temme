import { msg, CaptureResult, defaultFilterMap } from '../src'

test('get null from empty CaptureResult instance', () => {
  const emptyCaptureResult = new CaptureResult({})
  expect(emptyCaptureResult.getResult()).toBe(null)
})

test('get values from a simple CaptureResult instance', () => {
  const r = new CaptureResult({})
  r.add('key-1', 'value-1')
  r.add('key-2', 'value-2')
  r.add('key-3', 'value-3')
  expect(r.get('key-1')).toEqual('value-1')
  expect(r.get('key-2')).toEqual('value-2')
  expect(r.get('key-3')).toEqual('value-3')
  expect(r.getResult()).toEqual({
    'key-1': 'value-1',
    'key-2': 'value-2',
    'key-3': 'value-3',
  })
})

test('when not force, it should ignore adding null or undefined', () => {
  const r = new CaptureResult({})
  r.add('k1', null)
  r.add('k2', undefined)
  expect(r.getResult()).toEqual(null)

  r.add('k3', 111)
  expect(r.getResult()).toEqual({ k3: 111 })

  r.add('k4', null)
  expect(r.getResult()).toEqual({ k3: 111 })
})

test('force add', () => {
  const r = new CaptureResult({})
  r.add('k1', null, null)
  r.forceAdd('k2', null, null)
  expect(r.getResult()).toEqual({ k2: null })
})

test('fail a CaptureResult', () => {
  const r = new CaptureResult({})
  r.add('k1', null)
  r.forceAdd('k2', null, null)
  r.add('k3', 'v3')

  expect(r.getResult()).toEqual({
    k2: null,
    k3: 'v3',
  })

  expect(r.isFailed()).toBe(false)
  expect(r.get('k3')).toBe('v3')
  r.setFailed()
  expect(r.isFailed()).toBe(true)
  expect(r.getResult()).toBe(null)
  expect(r.get('k3')).toBe(null)

  r.add('k4', 'v4')
  r.add('k5', 'v5')
  r.forceAdd('k6', 'v6')
  expect(r.isFailed()).toBe(true)
  expect(r.getResult()).toBe(null)
})

test('merge CaptureResult', () => {
  const a = new CaptureResult({})
  a.add('a1', 'v1')
  a.add('a2', 'v2')

  const b = new CaptureResult({})
  b.add('b1', 'w1')
  b.add('b2', 'w2')

  expect(a.getResult()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })

  a.mergeWithFailPropagation(b)
  expect(a.getResult()).toEqual({
    a1: 'v1',
    a2: 'v2',
    b1: 'w1',
    b2: 'w2',
  })
})

test('merge propagates capture-failure', () => {
  const a = new CaptureResult({})
  a.add('a1', 'v1')
  a.add('a2', 'v2')

  const b = new CaptureResult({})
  b.setFailed()

  expect(a.getResult()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })

  a.mergeWithFailPropagation(b)
  expect(a.isFailed()).toBe(true)
})

test('merge without fail-propagation changes nothing', () => {
  const a = new CaptureResult({})
  a.add('a1', 'v1')
  a.add('a2', 'v2')

  const b = new CaptureResult({})
  b.add('b1', 'w1')
  b.add('b2', 'w2')
  b.setFailed()

  expect(a.getResult()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })

  a.merge(b)
  expect(a.getResult()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })
  expect(a.isFailed()).toBe(false)
})

test('applyFilterList from  defaultFilterMap', () => {
  const r = new CaptureResult(defaultFilterMap)
  r.add('k1', [0, 1, null, true, false], [{ isArrayFilter: false, name: 'compact', args: [] }])
  expect(r.getResult()).toEqual({ k1: [1, true] })

  r.add('k2', [{ x: 1 }, { y: 2 }, { z: 3 }], [{ isArrayFilter: false, name: 'pack', args: [] }])
  expect(r.getResult()).toEqual({
    k1: [1, true],
    k2: { x: 1, y: 2, z: 3 },
  })

  r.add('k3', '1234', [{ isArrayFilter: false, name: 'Number', args: [] }])
  expect(r.getResult()).toEqual({
    k1: [1, true],
    k2: { x: 1, y: 2, z: 3 },
    k3: 1234,
  })
})

test('applyFilterList from prototype chain', () => {
  const r = new CaptureResult({})
  r.add('k1', 'lowercase', [{ isArrayFilter: false, name: 'toUpperCase', args: [] }])
  expect(r.getResult()).toEqual({
    k1: 'LOWERCASE',
  })

  r.add('k2', 'longlongstring', [{ isArrayFilter: false, name: 'substring', args: [0, 4] }])
  expect(r.getResult()).toEqual({
    k1: 'LOWERCASE',
    k2: 'long',
  })
})

test('apply multiple filters', () => {
  const r = new CaptureResult(defaultFilterMap)
  r.add('k1', '1234', [
    { isArrayFilter: false, name: 'substring', args: [1, 3] },
    { isArrayFilter: false, name: 'Number', args: [] },
  ])
  expect(r.getResult()).toEqual({
    k1: 23,
  })

  r.add(
    'k2',
    [0, 'a', 'b', 'c', 'd', false],
    [
      { isArrayFilter: false, name: 'compact', args: [] }, // [ 'a', 'b', 'c', 'd' ]
      { isArrayFilter: false, name: 'join', args: [','] }, // 'a,b,c,d'
      { isArrayFilter: false, name: 'substring', args: [0, 3] }, // 'a,b'
      { isArrayFilter: false, name: 'split', args: [','] }, // [ 'a', 'b' ]
      { isArrayFilter: false, name: 'slice', args: [1] }, // [ 'b' ]
    ],
  )

  expect(r.getResult()).toEqual({
    k1: 23,
    k2: ['b'],
  })
})

test('invalid filter', () => {
  const r = new CaptureResult(defaultFilterMap)
  expect(() => r.add('k1', [], [{ isArrayFilter: false, name: 'compact', args: [] }])).not.toThrow()

  expect(() =>
    r.add('k2', 'value-2', [{ isArrayFilter: false, name: 'foo', args: [1, 2, 3] }]),
  ).toThrow(msg.invalidFilter('foo'))

  expect(() =>
    r.add('k3', 'value-3', [{ isArrayFilter: false, name: 'trim', args: [] }]),
  ).not.toThrow()

  expect(() => r.add('k4', 'value-4', [{ isArrayFilter: false, name: 'bar', args: [] }])).toThrow(
    msg.invalidFilter('bar'),
  )
})
