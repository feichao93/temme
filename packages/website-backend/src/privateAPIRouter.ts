import Router from 'koa-router'
import { Html, Selector } from './interfaces'

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
  await ctx.service.projects.insertOne({
    projectId,
    userId,
    name,
    description,
    folders: [],
    createdAt: now,
    updatedAt: now,
  })
  ctx.body = ''
}

// 可以支持一下 30 天内恢复
async function deleteProject(ctx: Router.IRouterContext) {
  const { projectId } = ctx.request.body
  const userId = ctx.session.userId

  const project = await ctx.service.projects.findOne({ projectId })
  ctx.assert(project, 404)
  ctx.assert(project.userId === userId, 401)

  const folderIds = project.folders.map(fld => fld.folderId)
  await ctx.service.projects.deleteOne({ projectId })
  await ctx.service.htmls.deleteMany({ folderId: { $in: folderIds } })
  await ctx.service.selectors.deleteMany({ folderId: { $in: folderIds } })
  ctx.body = ''
}

// TODO
async function updateProject(ctx: Router.IRouterContext) {
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
  ctx.body = ''
}

async function addFolder(ctx: Router.IRouterContext) {
  const { projectId, name, description } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid name - ${name}`)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkProjectOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  const project = await ctx.service.projects.findOne({ projectId })
  const folderId = await ctx.service.getNextFolderId()
  const now = new Date().toISOString()

  const newFolder = {
    folderId,
    name,
    description,
    updatedAt: now,
    createdAt: now,
    htmlIds: [] as number[],
    selectorIds: [] as number[],
  }
  project.folders.push(newFolder)
  await ctx.service.projects.updateOne(
    { projectId },
    { $set: { folders: project.folders, updatedAt: now } },
  )
  ctx.body = newFolder
}

async function renameFolder(ctx: Router.IRouterContext) {
  const { folderId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid name - ${name}`)

  const project = await ctx.service.projects.findOne({ 'folders.folderId': folderId })
  ctx.assert(project, 404)
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toDateString()
  const folder = project.folders.find(fld => fld.folderId == folderId)
  folder.name = name
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now, folders: project.folders } },
  )

  ctx.body = ''
}

async function deleteFolder(ctx: Router.IRouterContext) {
  const { folderId } = ctx.request.body
  const project = await ctx.service.projects.findOne({ 'folders.folderId': folderId })
  ctx.assert(project, 404)

  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const folder = project.folders.find(fld => fld.folderId === folderId)
  remove(project.folders, folder)
  const now = new Date().toISOString()
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { folders: project.folders, updatedAt: now } },
  )

  ctx.body = ''
}

async function addHtml(ctx: Router.IRouterContext) {
  const { folderId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, 'Invalid name')
  const userId = ctx.session.userId
  const project = await ctx.service.projects.findOne({ 'folders.folderId': folderId })
  ctx.assert(project, 404)
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  const htmlId = await ctx.service.getNextHtmlId()
  const folder = project.folders.find(fld => fld.folderId === folderId)
  folder.htmlIds.push(htmlId)
  const html: Html = {
    htmlId,
    name,
    content: '',
    folderId,
    createdAt: now,
    updatedAt: now,
  }
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now, folders: project.folders } },
  )
  await ctx.service.htmls.insertOne(html)
  ctx.body = html
}

async function updateHtml(ctx: Router.IRouterContext) {
  const { htmlId, content } = ctx.request.body

  const html = await ctx.service.htmls.findOne({ htmlId })
  ctx.assert(html, 404)

  const project = await ctx.service.projects.findOne({ 'folders.folderId': html.folderId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  await ctx.service.htmls.updateOne({ htmlId }, { $set: { content, updatedAt: now } })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  ctx.body = ''
}

async function deleteHtml(ctx: Router.IRouterContext) {
  const { htmlId } = ctx.request.body

  const html = await ctx.service.htmls.findOne({ htmlId })
  ctx.assert(html, 404)

  const project = await ctx.service.projects.findOne({ 'folders.folderId': html.folderId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  const folder = project.folders.find(fld => fld.folderId === html.folderId)
  remove(folder.htmlIds, htmlId)
  await ctx.service.htmls.deleteOne({ htmlId })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now, folders: project.folders } },
  )
  ctx.body = ''
}

async function addSelector(ctx: Router.IRouterContext) {
  const { folderId, name } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, 'Invalid name')
  const userId = ctx.session.userId
  const project = await ctx.service.projects.findOne({ 'folders.folderId': folderId })
  ctx.assert(project, 404)
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  const selectorId = await ctx.service.getNextSelectorId()
  const folder = project.folders.find(fld => fld.folderId === folderId)
  folder.selectorIds.push(selectorId)
  const selector: Selector = {
    selectorId,
    name,
    content: '',
    folderId,
    createdAt: now,
    updatedAt: now,
  }
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now, folders: project.folders } },
  )
  await ctx.service.selectors.insertOne(selector)
  ctx.body = selector
}

async function updateSelector(ctx: Router.IRouterContext) {
  const { selectorId, content } = ctx.request.body

  const selector = await ctx.service.selectors.findOne({ selectorId })
  ctx.assert(selector, 404)

  const project = await ctx.service.projects.findOne({ 'folders.folderId': selector.folderId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  await ctx.service.selectors.updateOne({ selectorId }, { $set: { content, updatedAt: now } })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  ctx.body = ''
}

async function renameHtml(ctx: Router.IRouterContext) {
  const { htmlId, newName } = ctx.request.body
  ctx.assert(typeof newName === 'string' && newName.length > 0, 400, 'Invalid new html name')

  const project = await ctx.service.projects.findOne({ htmlIds: htmlId })
  ctx.assert(project, 404)
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  await ctx.service.htmls.updateOne({ htmlId }, { $set: { name: newName, updatedAt: now } })
  ctx.body = ''
}

async function renameSelector(ctx: Router.IRouterContext) {
  const { selectorId, newName } = ctx.request.body
  ctx.assert(typeof newName === 'string' && newName.length > 0, 400, 'Invalid new selector name')

  const project = await ctx.service.projects.findOne({ selectorIds: selectorId })
  ctx.assert(project, 404)
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now } },
  )
  await ctx.service.selectors.updateOne({ selectorId }, { $set: { name: newName, updatedAt: now } })
  ctx.body = ''
}

async function deleteSelector(ctx: Router.IRouterContext) {
  const { selectorId } = ctx.request.body

  const selector = await ctx.service.selectors.findOne({ selectorId })
  ctx.assert(selector, 404)

  const project = await ctx.service.projects.findOne({ 'folders.folderId': selector.folderId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  const folder = project.folders.find(fld => fld.folderId === selector.folderId)
  remove(folder.selectorIds, selectorId)
  await ctx.service.selectors.deleteOne({ selectorId })
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { updatedAt: now, folders: project.folders } },
  )
  ctx.body = ''
}

export default new Router({ prefix: '/api' })
  .use(requireSignedIn)
  .post('/add-project', addProject)
  .post('/delete-project', deleteProject)
  .post('/update-project', updateProject)
  // TODO rename project

  .post('/add-folder', addFolder)
  .post('/rename-folder', renameFolder)
  .post('/delete-folder', deleteFolder)

  .post('/add-html', addHtml)
  .post('/update-html', updateHtml)
  .post('/delete-html', deleteHtml)
  .post('/rename-html', renameHtml)

  .post('/add-selector', addSelector)
  .post('/update-selector', updateSelector)
  .post('/rename-selector', renameSelector)
  .post('/delete-selector', deleteSelector)
