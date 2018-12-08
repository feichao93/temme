import Router from 'koa-router'

const privateAPIRouter = new Router({ prefix: '/api' })

privateAPIRouter.use(function requireSignedIn(ctx, next) {
  const userId = ctx.session.userId
  if (userId == null) {
    ctx.throw(401, 'Need signed in.')
  }
  return next()
})

// 创建新的 project
privateAPIRouter.post('/add-project', async ctx => {
  const { name, description = '' } = ctx.request.body
  if (typeof name !== 'string' || name === '') {
    ctx.throw(400, 'Invalid new project name.')
  }
  const userId = ctx.session.userId
  const briefProjects = await ctx.service.getBriefProjectListByUser(userId)
  if (briefProjects.some(p => p.name === name)) {
    ctx.throw(400, 'Project name already exists')
  }
  await ctx.service.addProject(userId, name, description)
  ctx.status = 200
})

// 删除 project
privateAPIRouter.post('/delete-project/:projectId', async ctx => {
  const projectId = Number(ctx.params.projectId)
  if (isNaN(projectId)) {
    ctx.throw(400, `Invalid projectId ${ctx.params.projectId}`)
  }
  const userId = ctx.session.userId
  if (!ctx.service.checkOwnerShip(userId, projectId)) {
    ctx.throw(401, `No access to project with id ${projectId}`)
  }
  await ctx.service.projects.deleteOne({ projectId })
  ctx.status = 200
})

// 获取 project 信息

// 创建新的 folder
privateAPIRouter.post('/add-folder', async ctx => {
  const { projectId, name, description = '' } = ctx.request.body
  const userId = ctx.session.userId
  if (!ctx.service.checkOwnerShip(userId, projectId)) {
    ctx.throw(401, `No access to project with id ${projectId}`)
  }
  if (typeof name !== 'string' || name === '') {
    ctx.throw(400, 'Invalid new folder name')
  }
  const project = await ctx.service.projects.findOne({ projectId })
  if (project.folders.some(f => f.name === name)) {
    ctx.throw(400, 'Duplicated folder name')
  }

  const folders = project.folders
  const now = new Date().toISOString()
  folders.push({ name, description, files: [] })
  await ctx.service.projects.updateOne({ projectId }, { $set: { folders, updatedAt: now } })
  ctx.status = 200
})

// 删除 folder
privateAPIRouter.post('/delete-folder', async ctx => {
  const { projectId, name, description = '' } = ctx.request.body
  const userId = ctx.session.userId
  if (!ctx.service.checkOwnerShip(userId, projectId)) {
    ctx.throw(401, `No access to project with id ${projectId}`)
  }
  if (typeof name !== 'string' || name === '') {
    ctx.throw(400, 'Invalid new folder name')
  }
  const project = await ctx.service.projects.findOne({ projectId })
  if (project.folders.some(f => f.name === name)) {
    ctx.throw(400, 'Duplicated folder name')
  }

  const folders = project.folders
  const now = new Date().toISOString()
  folders.push({ name, description, files: [] })
  await ctx.service.projects.updateOne({ projectId }, { $set: { folders, updatedAt: now } })
  ctx.status = 200
})

// 新增文件
privateAPIRouter.post('/add-file', async ctx => {
  const { projectId, folderName, filename } = ctx.request.body
  // TODO check parameters
  const userId = ctx.session.userId
  // TODO check ownership
  const project = await ctx.service.projects.findOne({ projectId })
  const now = new Date().toISOString()
  const folder = project.folders.find(f => f.name === folderName)
  folder.files.push({
    filename,
    createdAt: now,
    updatedAt: now,
    content: '',
  })
  project.updatedAt = now
  await ctx.service.projects.updateOne({ projectId }, project)
})

privateAPIRouter.post('/edit-file', async ctx => {
  const { projectId, folderName, filename, content } = ctx.request.body
  // TODO check parameters
  const userId = ctx.session.userId
  // TODO check ownership
  const project = await ctx.service.projects.findOne({ projectId })
  const now = new Date().toISOString()
  const folder = project.folders.find(f => f.name === folderName)
  const file = folder.files.find(f => f.filename === filename)
  file.content = content
  project.updatedAt = now
  await ctx.service.projects.updateOne({ projectId }, project)
})

privateAPIRouter.post('/delete-file', async ctx => {
  const { projectId, folderName, filename } = ctx.request.body
  // TODO check parameters
  const userId = ctx.session.userId
  // TODO check ownership
  const project = await ctx.service.projects.findOne({ projectId })
  const now = new Date().toISOString()
  const folder = project.folders.find(f => f.name === folderName)
  folder.files = folder.files.filter(f => f.filename !== filename)
  project.updatedAt = now
  await ctx.service.projects.updateOne({ projectId }, project)
})

export default privateAPIRouter
