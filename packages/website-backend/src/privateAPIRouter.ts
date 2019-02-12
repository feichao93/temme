import Router from 'koa-router'
import { Page, Project } from './interfaces'

function remove<T>(array: T[], item: T) {
  const index = array.indexOf(item)
  array.splice(index, 1)
}

function requireSignedIn(ctx: Router.IRouterContext, next: any) {
  const userId = ctx.session.userId
  ctx.assert(userId && userId !== -1, 401, 'Require signed in')
  return next()
}

// 创建新的 project
async function addProject(ctx: Router.IRouterContext) {
  const { name, description } = ctx.request.body

  const isNameValid = typeof name === 'string' && name.length > 0
  ctx.assert(isNameValid, 400, 'Invalid new project name.')

  const userId = ctx.session.userId
  const existedProject = await ctx.service.projects.findOne({ name, userId })
  ctx.assert(existedProject == null, 400, 'Project name already exists')

  const projectId = await ctx.service.getNextProjectId()
  const now = new Date().toISOString()
  const newProject: Project = {
    projectId,
    userId,
    name,
    description,
    pageIds: [],
    createdAt: now,
    updatedAt: now,
  }
  await ctx.service.projects.insertOne(newProject)
  ctx.body = newProject
}

// 删除一个 project
async function deleteProject(ctx: Router.IRouterContext) {
  const { projectId } = ctx.request.body
  const userId = ctx.session.userId

  const project = await ctx.service.projects.findOne({ projectId })
  ctx.assert(project, 404)
  ctx.assert(project.userId === userId, 401)

  await ctx.service.projects.deleteOne({ projectId })
  await ctx.service.pages.deleteMany({ pageId: { $in: project.pageIds } })
  ctx.status = 200
}

// TODO 更新一个 project 的元数据，名称、描述等
async function updateProjectMeta(ctx: Router.IRouterContext) {
  const { projectId, name, description } = ctx.request.body
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
  ctx.body = ''
}

async function addPage(ctx: Router.IRouterContext) {
  const { projectId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid name - ${name}`)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkProjectOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  const project = await ctx.service.projects.findOne({ projectId })
  const pageId = await ctx.service.getNextPageId()
  const now = new Date().toISOString()

  const newPage: Page = {
    pageId,
    projectId: project.projectId,
    name,
    updatedAt: now,
    createdAt: now,
    html: '',
    selector: '',
  }
  project.pageIds.push(pageId)
  await ctx.service.pages.insertOne(newPage)
  await ctx.service.projects.updateOne(
    { projectId },
    { $set: { pageIds: project.pageIds, updatedAt: now } },
  )
  ctx.body = newPage
}

async function updatePage(ctx: Router.IRouterContext) {
  const { pageId, html, selector } = ctx.request.body
  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page != null, 404)
  const project = await ctx.service.projects.findOne({ projectId: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toDateString()
  await ctx.service.pages.updateOne({ pageId }, { $set: { updatedAt: now, html, selector } })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  ctx.status = 200
}

async function renamePage(ctx: Router.IRouterContext) {
  const { pageId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid name - ${name}`)

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page != null, 404)
  const project = await ctx.service.projects.findOne({ projectId: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toDateString()
  await ctx.service.pages.updateOne({ pageId }, { $set: { updatedAt: now, name } })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )

  ctx.status = 200
}

async function deletePage(ctx: Router.IRouterContext) {
  const { pageId } = ctx.request.body
  const project = await ctx.service.projects.findOne({ pageIds: pageId })
  ctx.assert(project, 404)

  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  remove(project.pageIds, pageId)
  const now = new Date().toISOString()
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { pageIds: project.pageIds, updatedAt: now } },
  )
  await ctx.service.pages.deleteOne({ pageId })

  ctx.status = 200
}

export default new Router({ prefix: '/api' })
  .use(requireSignedIn)
  .post('/add-project', addProject)
  .post('/delete-project', deleteProject)
  .post('/update-project-meta', updateProjectMeta)

  .post('/add-page', addPage)
  .post('/update-page', updatePage)
  .post('/rename-page', renamePage)
  .post('/delete-page', deletePage)
