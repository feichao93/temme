import Router from 'koa-router'
import { Project } from './interfaces'

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
    folderIds: [],
    createdAt: dateString,
    updatedAt: dateString,
  }
  await ctx.service.projects.insertOne(projectDoc)

  ctx.status = 200
})

// 删除 project
privateAPIRouter.post('/delete-project/:projectId', async ctx => {
  const projectId = Number(ctx.params.projectId)
  ctx.assert(!isNaN(projectId), 400, `Invalid projectId ${ctx.params.projectId}`)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  await ctx.service.projects.deleteOne({ projectId })
  await ctx.service.folders.deleteMany({ projectId })
  ctx.status = 200
})

// 创建新的 folder
privateAPIRouter.post('/add-folder', async ctx => {
  const { projectId, name, description = '' } = ctx.request.body
  ctx.assert(typeof name === 'string' && name.length > 0, 400, `Invalid new folder name - ${name}`)

  const userId = ctx.session.userId
  const ownership = await ctx.service.checkOwnership(userId, projectId)
  ctx.assert(ownership, 401, `No access to project with id ${projectId}`)

  const project = await ctx.service.projects.findOne({ projectId })

  const existedFoldersInThisProject = await ctx.service.folders
    .find({ folderId: { $in: project.folderIds } })
    .project({ name: true })
    .toArray()
  ctx.assert(existedFoldersInThisProject.every(f => f.name !== name), 400, 'Duplicated folder name')

  const folderId = await ctx.service.getNextFolderId()
  const now = new Date().toISOString()

  await ctx.service.folders.insertOne({ folderId, projectId, description, files: [], name })

  const folderIds = project.folderIds
  folderIds.push(folderId)
  await ctx.service.projects.updateOne({ projectId }, { $set: { folderIds, updatedAt: now } })

  ctx.status = 200
})

// 删除 folder
privateAPIRouter.post('/delete-folder', async ctx => {
  const { folderId } = ctx.request.body
  const folder = await ctx.service.folders.findOne({ folderId })
  ctx.assert(folder, 404)

  const project = await ctx.service.projects.findOne({ projectId: folder.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  await ctx.service.folders.deleteOne({ folderId })

  const now = new Date().toISOString()
  const folderIds = project.folderIds
  remove(folderIds, folderId)
  await ctx.service.projects.updateOne(
    { projectId: project.projectId },
    { $set: { folderIds, updatedAt: now } },
  )

  ctx.status = 200
})

// 新增文件
privateAPIRouter.post('/add-file', async ctx => {
  const { folderId, filename } = ctx.request.body
  // TODO check parameters

  const folder = await ctx.service.folders.findOne({ folderId })
  ctx.assert(folder, 404)
  const project = await ctx.service.projects.findOne({ projectId: folder.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  folder.files.push({
    filename,
    createdAt: now,
    updatedAt: now,
    content: '',
  })
  project.updatedAt = now

  await ctx.service.projects.updateOne({ projectId: project.projectId }, project)
  await ctx.service.folders.updateOne({ folderId }, folder)

  ctx.status = 200
})

// 编辑文件
privateAPIRouter.post('/edit-file', async ctx => {
  const { folderId, filename, content } = ctx.request.body
  // TODO check parameters

  const folder = await ctx.service.folders.findOne({ folderId })
  ctx.assert(folder, 404)

  const project = await ctx.service.projects.findOne({ projectId: folder.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()

  const file = folder.files.find(f => f.filename === filename)
  file.content = content
  file.updatedAt = now
  await ctx.service.folders.updateOne({ folderId }, folder)

  project.updatedAt = now
  await ctx.service.projects.updateOne({ projectId: project.projectId }, project)
})

// TODO rename file

// 删除文件
privateAPIRouter.post('/delete-file', async ctx => {
  const { folderId, filename } = ctx.request.body
  // TODO check parameters

  const folder = await ctx.service.folders.findOne({ folderId })
  ctx.assert(folder, 404)

  const project = await ctx.service.projects.findOne({ projectId: folder.projectId })
  const userId = ctx.session.userId
  ctx.assert(project.userId === userId, 401)

  const now = new Date().toISOString()
  folder.files = folder.files.filter(f => f.filename !== filename)
  await ctx.service.folders.updateOne({ folderId }, folder)

  project.updatedAt = now
  await ctx.service.projects.updateOne({ projectId: project.projectId }, project)

  ctx.status = 200
})

export default privateAPIRouter
