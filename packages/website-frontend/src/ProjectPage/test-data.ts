export const ahtml = `<ul>
  <li>key-1 value-1</li>
  <li>key-2 value-2</li>
</ul>`

export const btemme = `procedure pair(result, node, keyCapture, valueCapture) {
  const [key, value] = node.text().split(/\\s+/)
  result.add(keyCapture, key)
  result.add(valueCapture, value)
}

li@ {
  &{ pair($k, $v) }
}`

export const chtml = `<a href="https://github.com/shinima/temme">Star Me on <span>GitHub</span></a>`

export const project = {
  projectId: 1,
  userId: 1,
  name: 'test-project',
  description: '测试项目描述测试项目描述测试项目描述',
  pageIds: [1, 2],
  createAt: '2018-12-13T03:06:58.579Z',
  updatedAt: '2018-12-13T03:06:58.579Z',
}

export const pages = [
  {
    pageId: 1,
    projectId: 1,
    name: 'page-1',
    description: 'no-desc',
    html: ahtml,
    createAt: '2018-12-13T03:06:58.579Z',
    updatedAt: '2018-12-13T03:06:58.579Z',
    selectors: [
      {
        name: 'b.temme',
        content: btemme,
        createAt: '2018-12-13T03:06:58.579Z',
        updatedAt: '2018-12-13T03:06:58.579Z',
      },
    ],
  },
  {
    pageId: 2,
    projectId: 1,
    name: 'page-2',
    description: 'no-description',
    html: chtml,
    createAt: '2018-12-13T03:06:58.579Z',
    updatedAt: '2018-12-13T03:06:58.579Z',
    selectors: [
      {
        name: 'b.temme',
        content: btemme,
        createAt: '2018-12-13T03:06:58.579Z',
        updatedAt: '2018-12-13T03:06:58.579Z',
      },
    ],
  },
]
