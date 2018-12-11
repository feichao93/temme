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
    ctx.body = { userId: -1, login: null }
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

// 查看每个用户的 project 列表
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
  ctx.body = project
})

// 查看某个文件的内容
publicAPIRouter.get('/files/:folderId/:filename', async ctx => {
  const folderId = Number(ctx.params.folderId)
  ctx.assert(!isNaN(folderId), 404)
  const filename = ctx.params.filename
  ctx.assert(typeof filename === 'string', 404)

  const folder = await ctx.service.folders.findOne({ folderId })
  ctx.assert(folder, 404)

  const file = folder.files.find(file => file.filename === filename)
  ctx.assert(file, 404)

  ctx.set('content-type', 'text/plain')
  ctx.body = file.content
})

export default publicAPIRouter
