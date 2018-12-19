import Router from 'koa-router'
import { Page, Project } from './interfaces'

function remove<T>(array: T[], item: T) {
  const index = array.indexOf(item)
  array.splice(index, 1)
}

const privateAPIRouter = new Router({ prefix: '/api' })

privateAPIRouter.use(function requireSignedIn(ctx, next) {
  const userId = ctx.session.userId
  ctx.assert(userId && userId !== -1, 401, 'Require signed in')
  return next()
})

// 创建新的 project
privateAPIRouter.post('/add-project', async ctx => {
  const { name, description = '' } = ctx.request.body

  const isNameValid = typeof name === 'string' && name.length > 0
  ctx.assert(isNameValid, 400, 'Invalid new project name.')

  const userId = ctx.session.userId
  const existedProject = await ctx.service.projects.findOne({ name, userId })
  ctx.assert(existedProject == null, 400, 'Project name already exists')

  const projectId = await ctx.service.getNextProjectId()
  const dateString = new Date().toISOString()
  const projectDoc: Project = {
    userId,
    projectId,
    name,
    description,
    pageIds: [],
    createdAt: dateString,
    updatedAt: dateString,
  }
  await ctx.service.projects.insertOne(projectDoc)

  ctx.status = 200
})

// 更新 html
privateAPIRouter.post('/update-html', async ctx => {
  const { pageId, content } = ctx.request.body

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)

  const project = await ctx.service.projects.findOne({ projectId: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  await ctx.service.pages.updateOne({ pageId }, { $set: { html: content } })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  ctx.status = 200
})

// 删除 project
privateAPIRouter.post('/delete-project', async ctx => {
  const { projectId } = ctx.request.body
  const userId = ctx.session.userId

  const ownership = await ctx.service.checkOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  await ctx.service.projects.deleteOne({ projectId })
  await ctx.service.pages.deleteMany({ projectId })
  ctx.status = 200
})

privateAPIRouter.post('/update-project', async ctx => {
  const { name, description, projectId } = ctx.request.body
  const isNameValid = typeof name === 'string' && name.length > 0
  ctx.assert(isNameValid, 400, 'Invalid new project name.')

  const userId = ctx.session.userId
  const existedProject = await ctx.service.projects.findOne({ projectId, userId })
  ctx.assert(existedProject.name == name, 400, 'Project name already exists')

  const now = new Date().toISOString()
  await ctx.service.projects.updateOne(
    { projectId },
    { $set: { name, description, updatedAt: now } },
  )
  ctx.status = 200
})
// 创建新的 page
privateAPIRouter.post('/add-page', async ctx => {
  const { projectId, name, description = '' } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid new page name - ${name}`)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  const project = await ctx.service.projects.findOne({ projectId })

  const pageWithSameName = await ctx.service.pages.findOne({
    pageId: { $in: project.pageIds },
    name,
  })
  ctx.assert(pageWithSameName == null, 400, 'Duplicated page name')

  const pageId = await ctx.service.getNextPageId()
  const now = new Date().toISOString()

  const newPage: Page = {
    pageId,
    projectId,
    name,
    description,
    html: '',
    createdAt: now,
    updatedAt: now,
    selectors: [],
  }
  await ctx.service.pages.insertOne(newPage)

  const pageIds = project.pageIds
  pageIds.push(pageId)
  await ctx.service.projects.updateOne({ projectId }, { $set: { pageIds, updatedAt: now } })

  ctx.body = newPage
})

// rename page
privateAPIRouter.post('/rename-page', async ctx => {
  const { pageId, name, projectId } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid new page name - ${name}`)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  const pageWithSameName = await ctx.service.pages.findOne({
    projectId,
    pageId: { $not: { $eq: pageId } },
    name,
  })
  ctx.assert(pageWithSameName == null, 400, 'Duplicated page name')

  const now = new Date().toDateString()
  await ctx.service.pages.updateOne({ pageId }, { $set: { name, updatedAt: now } })

  ctx.status = 200
})
// 删除 page
privateAPIRouter.post('/delete-page', async ctx => {
  const { pageId } = ctx.request.body
  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)

  const project = await ctx.service.projects.findOne({ projectId: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  await ctx.service.pages.deleteOne({ pageId })

  const now = new Date().toISOString()
  const pageIds = project.pageIds
  remove(pageIds, pageId)
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { pageIds, updatedAt: now } },
  )

  ctx.status = 200
})

// 新增选择器
privateAPIRouter.post('/add-selector', async ctx => {
  const { pageId, name } = ctx.request.body
  // TODO check parameters

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)
  const project = await ctx.service.projects.findOne(
    { projectId: page.projectId },
    { projection: { _id: false } },
  )
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  page.selectors.push({
    name,
    createdAt: now,
    updatedAt: now,
    content: '',
  })

  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  await ctx.service.pages.findOneAndReplace({ pageId }, page)

  ctx.status = 200
})

// 更新选择器
privateAPIRouter.post('/update-selector', async ctx => {
  const { pageId, name, content } = ctx.request.body
  // TODO check parameters

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)

  const project = await ctx.service.projects.findOne({ projectId: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()

  const file = page.selectors.find(s => s.name === name)
  file.content = content
  file.updatedAt = now
  await ctx.service.pages.findOneAndReplace({ pageId }, page)

  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  ctx.status = 200
})

// rename selector
privateAPIRouter.post('/rename-selector', async ctx => {
  const { pageId, selectorName, newName } = ctx.request.body
  ctx.assert(
    typeof newName === 'string' && newName.length > 0,
    400,
    `Invalid new selector name - ${newName}`,
  )

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkOwnership(userId, page.projectId)
  ctx.assert(ownership, 401, `No access to project with id ${page.projectId}`)
  ctx.assert(
    page.selectors.find(s => s.name === newName) == null,
    400,
    'Duplicated selector newName',
  )

  const now = new Date().toISOString()
  const selector = page.selectors.find(s => s.name === selectorName)
  selector.name = newName
  selector.updatedAt = now

  await ctx.service.pages.updateOne(
    { projectId: page.projectId, pageId },
    { $set: { updatedAt: now, selectors: page.selectors } },
  )
  ctx.status = 200
})
// 删除选择器
privateAPIRouter.post('/delete-selector', async ctx => {
  const { pageId, name } = ctx.request.body
  // TODO check parameters

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)

  const project = await ctx.service.projects.findOne({ projectId: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  page.selectors = page.selectors.filter(s => s.name !== name)
  await ctx.service.pages.findOneAndReplace({ pageId }, page)

  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )

  ctx.status = 200
})

export default privateAPIRouter
