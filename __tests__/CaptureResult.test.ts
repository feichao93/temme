import { msg, CaptureResult, defaultFilterMap } from '../src'
import { defaultModifierMap } from '../src/modifier'

// TODO 这个文件存在不需要的测试用例
// TODO 需要添加 modifier 的测试

function add(result: CaptureResult, key: string, value: any) {
  result.add({ name: key, filterList: [], modifier: null }, value)
}

function forceAdd(result: CaptureResult, key: string, value: any) {
  result.forceAdd({ name: key, filterList: [], modifier: null }, value)
}

function makeCaptureResult() {
  return new CaptureResult(defaultFilterMap, defaultModifierMap)
}

test('get null from empty CaptureResult instance', () => {
  const emptyCaptureResult = makeCaptureResult()
  expect(emptyCaptureResult.getResult()).toBe(null)
})

test('get values from a simple CaptureResult instance', () => {
  const r = makeCaptureResult()
  add(r, 'key-1', 'value-1')
  add(r, 'key-2', 'value-2')
  add(r, 'key-3', 'value-3')
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
  const r = makeCaptureResult()
  add(r, 'k1', null)
  add(r, 'k2', undefined)
  expect(r.getResult()).toEqual(null)

  add(r, 'k3', 111)
  expect(r.getResult()).toEqual({ k3: 111 })

  add(r, 'k4', null)
  expect(r.getResult()).toEqual({ k3: 111 })
})

test('force add', () => {
  const r = makeCaptureResult()
  add(r, 'k1', null)
  forceAdd(r, 'k2', null)
  expect(r.getResult()).toEqual({ k2: null })
})

test('fail a CaptureResult', () => {
  const r = makeCaptureResult()
  add(r, 'k1', null)
  forceAdd(r, 'k2', null)
  add(r, 'k3', 'v3')

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

  add(r, 'k4', 'v4')
  add(r, 'k5', 'v5')
  forceAdd(r, 'k6', 'v6')
  expect(r.isFailed()).toBe(true)
  expect(r.getResult()).toBe(null)
})

test('merge CaptureResult', () => {
  const a = makeCaptureResult()
  add(a, 'a1', 'v1')
  add(a, 'a2', 'v2')

  const b = makeCaptureResult()
  add(b, 'b1', 'w1')
  add(b, 'b2', 'w2')

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
  const a = makeCaptureResult()
  add(a, 'a1', 'v1')
  add(a, 'a2', 'v2')

  const b = makeCaptureResult()
  b.setFailed()

  expect(a.getResult()).toEqual({
    a1: 'v1',
    a2: 'v2',
  })

  a.mergeWithFailPropagation(b)
  expect(a.isFailed()).toBe(true)
})

test('merge without fail-propagation changes nothing', () => {
  const a = makeCaptureResult()
  add(a, 'a1', 'v1')
  add(a, 'a2', 'v2')

  const b = makeCaptureResult()
  add(b, 'b1', 'w1')
  add(b, 'b2', 'w2')
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
  const r = makeCaptureResult()
  r.add(
    {
      name: 'k1',
      filterList: [{ isArrayFilter: false, name: 'compact', args: [] }],
      modifier: null,
    },
    [0, 1, null, true, false],
  )
  expect(r.getResult()).toEqual({ k1: [1, true] })

  r.add(
    { name: 'k2', filterList: [{ isArrayFilter: false, name: 'pack', args: [] }], modifier: null },
    [{ x: 1 }, { y: 2 }, { z: 3 }],
  )
  expect(r.getResult()).toEqual({
    k1: [1, true],
    k2: { x: 1, y: 2, z: 3 },
  })

  r.add(
    {
      name: 'k3',
      filterList: [{ isArrayFilter: false, name: 'Number', args: [] }],
      modifier: null,
    },
    '1234',
  )
  expect(r.getResult()).toEqual({
    k1: [1, true],
    k2: { x: 1, y: 2, z: 3 },
    k3: 1234,
  })
})

test('applyFilterList from prototype chain', () => {
  const r = makeCaptureResult()
  r.add(
    {
      name: 'k1',
      filterList: [{ isArrayFilter: false, name: 'toUpperCase', args: [] }],
      modifier: null,
    },
    'lowercase',
  )
  expect(r.getResult()).toEqual({
    k1: 'LOWERCASE',
  })

  r.add(
    {
      name: 'k2',
      filterList: [{ isArrayFilter: false, name: 'substring', args: [0, 4] }],
      modifier: null,
    },
    'longlongstring',
  )
  expect(r.getResult()).toEqual({
    k1: 'LOWERCASE',
    k2: 'long',
  })
})

test('apply multiple filters', () => {
  const r = makeCaptureResult()
  r.add(
    {
      name: 'k1',
      filterList: [
        { isArrayFilter: false, name: 'substring', args: [1, 3] },
        { isArrayFilter: false, name: 'Number', args: [] },
      ],
      modifier: null,
    },
    '1234',
  )
  expect(r.getResult()).toEqual({
    k1: 23,
  })

  r.add(
    {
      name: 'k2',
      filterList: [
        { isArrayFilter: false, name: 'compact', args: [] }, // [ 'a', 'b', 'c', 'd' ]
        { isArrayFilter: false, name: 'join', args: [','] }, // 'a,b,c,d'
        { isArrayFilter: false, name: 'substring', args: [0, 3] }, // 'a,b'
        { isArrayFilter: false, name: 'split', args: [','] }, // [ 'a', 'b' ]
        { isArrayFilter: false, name: 'slice', args: [1] }, // [ 'b' ]
      ],
      modifier: null,
    },
    [0, 'a', 'b', 'c', 'd', false],
  )

  expect(r.getResult()).toEqual({
    k1: 23,
    k2: ['b'],
  })
})

test('invalid filter', () => {
  const r = makeCaptureResult()
  expect(() =>
    r.add(
      {
        name: 'k1',
        filterList: [{ isArrayFilter: false, name: 'compact', args: [] }],
        modifier: null,
      },
      [],
    ),
  ).not.toThrow()

  expect(() =>
    r.add(
      {
        name: 'k2',
        filterList: [{ isArrayFilter: false, name: 'foo', args: [1, 2, 3] }],
        modifier: null,
      },
      'value-2',
    ),
  ).toThrow(msg.invalidFilter('foo'))

  expect(() =>
    r.add(
      {
        name: 'k3',
        filterList: [{ isArrayFilter: false, name: 'trim', args: [] }],
        modifier: null,
      },
      'value-3',
    ),
  ).not.toThrow()

  expect(() =>
    r.add(
      { name: 'k4', filterList: [{ isArrayFilter: false, name: 'bar', args: [] }], modifier: null },
      'value-4',
    ),
  ).toThrow(msg.invalidFilter('bar'))
})
