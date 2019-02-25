import Router from 'koa-router'
import uuid from 'uuid/v1'
import { getProjectDataFromZip, randomString, remove } from './common'
import { CreateProjectData, Page, Project } from './interfaces'

function requireSignedIn(ctx: Router.IRouterContext, next: any) {
  const userId = ctx.session.userId
  ctx.assert(userId && userId !== -1, 401, 'Require signed in')
  return next()
}

async function createProject(ctx: Router.IRouterContext) {
  const data: CreateProjectData = ctx.request.body
  const userId = ctx.session.userId
  data.name += `-${randomString()}` // 添加一个随机后缀，避免名称冲突
  await ctx.service.createProject(userId, data)
  const user = await ctx.service.users.findOne({ userId })
  ctx.body = { login: user.login, projectName: data.name }
}

async function createProjectByZip(ctx: Router.IRouterContext) {
  const uploadedFile = ctx.request.files.zipFile
  const { data, warnings } = await getProjectDataFromZip(uploadedFile)
  const userId = ctx.session.userId
  data.name += `-${randomString()}` // 添加一个随机后缀，避免名称冲突
  const project = await ctx.service.createProject(userId, data)
  ctx.body = { project, warnings }
}

// 创建新的 project
async function addProject(ctx: Router.IRouterContext) {
  const { name, description } = ctx.request.body

  const isNameValid = typeof name === 'string' && name.length > 0
  ctx.assert(isNameValid, 400, 'Invalid new project name.')

  const userId = ctx.session.userId
  const existedProject = await ctx.service.projects.findOne({ name, userId })
  ctx.assert(existedProject == null, 400, 'Project name already exists')

  const now = new Date().toISOString()
  const newProject: Project = {
    _id: uuid(),
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

  const project = await ctx.service.projects.findOne({ _id: projectId })
  ctx.assert(project, 404)
  ctx.assert(project.userId === userId, 401)

  await ctx.service.projects.deleteOne({ _id: projectId })
  await ctx.service.pages.deleteMany({ pageId: { $in: project.pageIds } })
  ctx.status = 200
}

async function updateProjectMeta(ctx: Router.IRouterContext) {
  const { projectId, name, description } = ctx.request.body
  const isNameValid = typeof name === 'string' && name.length > 0
  ctx.assert(isNameValid, 400, 'Invalid new project name.')

  const userId = ctx.session.userId
  const existedProject = await ctx.service.projects.findOne({
    name,
    userId,
    _id: { $not: { $eq: projectId } },
  })
  ctx.assert(existedProject == null, 400, 'Project name already used')

  const now = new Date().toISOString()
  await ctx.service.projects.updateOne(
    { _id: projectId },
    { $set: { name, description, updatedAt: now } },
  )
  ctx.status = 200
}

async function addPage(ctx: Router.IRouterContext) {
  const { projectId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid name - ${name}`)

  const userId = ctx.session.userId
  const project = await ctx.service.projects.findOne({ _id: projectId })
  ctx.assert(project != null, 404)
  ctx.assert(project.userId === userId, 401, `No access to project with id ${projectId}`)

  const pageId = uuid()
  const now = new Date().toISOString()

  const newPage: Page = {
    _id: pageId,
    projectId: project._id,
    name,
    updatedAt: now,
    createdAt: now,
    html: '',
    selector: '',
  }
  project.pageIds.push(pageId)
  await ctx.service.pages.insertOne(newPage)
  await ctx.service.projects.updateOne(
    { _id: projectId },
    { $set: { pageIds: project.pageIds, updatedAt: now } },
  )
  ctx.body = newPage
}

async function updatePage(ctx: Router.IRouterContext) {
  const { pageId, html, selector } = ctx.request.body
  const page = await ctx.service.pages.findOne({ _id: pageId })
  ctx.assert(page != null, 404)
  const project = await ctx.service.projects.findOne({ _id: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toDateString()
  await ctx.service.pages.updateOne({ _id: pageId }, { $set: { updatedAt: now, html, selector } })
  await ctx.service.projects.updateOne({ _id: project._id }, { $set: { updatedAt: now } })
  ctx.status = 200
}

async function updatePageMeta(ctx: Router.IRouterContext) {
  const { pageId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid name - ${name}`)

  const page = await ctx.service.pages.findOne({ _id: pageId })
  ctx.assert(page != null, 404)
  const project = await ctx.service.projects.findOne({ _id: page.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  await ctx.service.pages.updateOne({ _id: pageId }, { $set: { updatedAt: now, name } })
  await ctx.service.projects.updateOne({ _id: project._id }, { $set: { updatedAt: now } })

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
    { _id: project._id },
    { $set: { pageIds: project.pageIds, updatedAt: now } },
  )
  await ctx.service.pages.deleteOne({ _id: pageId })

  ctx.status = 200
}

export default new Router()
  .use(requireSignedIn)
  .post('/create-project', createProject)
  .post('/create-project-by-zip', createProjectByZip)
  .post('/add-project', addProject)
  .post('/delete-project', deleteProject)
  .post('/update-project-meta', updateProjectMeta)

  .post('/add-page', addPage)
  .post('/update-page', updatePage)
  .post('/update-page-meta', updatePageMeta)
  .post('/delete-page', deletePage)
