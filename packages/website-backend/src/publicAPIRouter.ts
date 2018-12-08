import Router from 'koa-router'

const publicAPIRouter = new Router({ prefix: '/api' })

// 查看当前登陆用户的信息
publicAPIRouter.get('/my-info', async ctx => {
  const userId = ctx.session.userId
  if (userId) {
    const user = await ctx.service.users.findOne({ userId })
    ctx.body = {
      userId: user.userId,
      login: user.userInfo.login,
    }
  } else {
    ctx.bdoy = { userId: -1, login: null }
  }
})

// 查看某个用户的个人信息
publicAPIRouter.get('/user-info/:login', async ctx => {
  const login = ctx.params.login
  const userProfile = await ctx.service.users.findOne({ login })
  if (userProfile == null) {
    ctx.throw(404, '')
  }
  ctx.body = userProfile.userInfo
})

publicAPIRouter.get('/user-info/:login/projects', async ctx => {
  const login = ctx.params.login
  ctx.assert(login != null, 404)
  const userProfile = await ctx.service.users.findOne({ login })
  ctx.assert(userProfile != null, 404)
  ctx.body = await ctx.service.projects
    .find({ userId: userProfile.userId })
    .project({ folders: false })
    .toArray()
})

// 查看某个 project 的大致信息
publicAPIRouter.get('/project/:projectId', async ctx => {
  const projectId = Number(ctx.params.projectId)
  const project = await ctx.service.projects.findOne({ projectId })
  ctx.assert(project != null, 404)
  for (const folder of project.folders) {
    for (const file of folder.files) {
      delete file.content
    }
  }
  ctx.body = project
})

// 查看某个文件的内容
publicAPIRouter.get('/file-content/:projectId/:folderName/:filename', async ctx => {
  const projectId = Number(ctx.params.projectId)
  const { folderName, filename } = ctx.query
  const project = await ctx.service.projects.findOne({ projectId })
  ctx.assert(project != null, 404)
  const folder = project.folders.find(f => f.name == folderName)
  ctx.assert(folder != null, 404)
  const file = folder.files.find(file => file.filename === filename)
  ctx.assert(file != null, 404)
  ctx.body = file.content
})

export default publicAPIRouter
