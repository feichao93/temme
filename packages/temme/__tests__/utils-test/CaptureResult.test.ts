import { CaptureResult, defaultFilterDict, defaultModifierDict, Modifier, msg } from '../../src'

// TODO 需要添加 modifier 的测试

function add(result: CaptureResult, key: string, value: any) {
  result.add({ name: key, filterList: [], modifier: null }, value)
}

function forceAdd(result: CaptureResult, key: string, value: any) {
  result.forceAdd({ name: key, filterList: [], modifier: null }, value)
}

function makeCaptureResult() {
  return new CaptureResult(defaultFilterDict, defaultModifierDict)
}

test('get null from empty CaptureResult instance', () => {
  const emptyCaptureResult = makeCaptureResult()
  expect(emptyCaptureResult.getResult()).toBe(null)
})

test('get values from a simple CaptureResult instance', () => {
  const r = makeCaptureResult()
  add(r, 'k1', 'v1')
  add(r, 'k2', 'v2')
  expect(r.get('k1')).toEqual('v1')
  expect(r.get('k2')).toEqual('v2')
  expect(r.getResult()).toEqual({ k1: 'v1', k2: 'v2' })
})

test('when not force, it should ignore adding null or undefined', () => {
  const r = makeCaptureResult()
  add(r, 'k1', null)
  add(r, 'k2', undefined)

  expect(r.getResult()).toEqual(null)
})

test('force add', () => {
  const r = makeCaptureResult()
  add(r, 'k1', null)
  forceAdd(r, 'k2', null)
  expect(r.getResult()).toEqual({ k2: null })
})

test('applyFilterList from defaultFilterDict', () => {
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
        name: 'key',
        filterList: [{ isArrayFilter: false, name: 'foo', args: [] }],
        modifier: null,
      },
      'value',
    ),
  ).toThrow(msg.invalidFilter('foo'))
})

test('invalid modifier', () => {
  const r = makeCaptureResult()
  const foo: Modifier = { name: 'foo', args: [] }
  expect(() => {
    r.add({ name: 'key', filterList: [], modifier: foo }, 'value')
  }).toThrow(msg.invalidModifier(foo.name))
})
