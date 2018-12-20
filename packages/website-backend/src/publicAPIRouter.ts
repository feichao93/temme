import Router from 'koa-router'
import CONFIG from '../config'
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
publicAPIRouter.get('/logout', async ctx => {
  ctx.session = null
  ctx.status = 200
})

// 请求client id
publicAPIRouter.get('/client-id', async ctx => {
  ctx.body = {
    clientId: CONFIG.oauthClientId,
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
  ctx.body = await ctx.service.projects.find({ userId: userProfile.userId }).toArray()
})

// 查看某个 project 的信息
publicAPIRouter.get('/project/:login/:projectName', async ctx => {
  const { login, projectName } = ctx.params
  const user = await ctx.service.users.findOne({ login })
  ctx.assert(user != null, 404)
  const project = await ctx.service.projects.findOne(
    { userId: user.userId, name: projectName },
    { projection: { _id: false } },
  )
  ctx.assert(project != null, 404)
  const pages = await ctx.service.pages
    .find({ projectId: project.projectId })
    .project({ _id: false })
    .toArray()
  ctx.body = { ...project, pages }
})

// 查看某个选择器的内容
publicAPIRouter.get('/selectors/:pageId/:name', async ctx => {
  const pageId = Number(ctx.params.pageId)
  ctx.assert(!isNaN(pageId), 404)
  const name = ctx.params.name
  ctx.assert(typeof name === 'string', 404)

  const page = await ctx.service.pages.findOne({ pageId })
  ctx.assert(page, 404)

  const selector = page.selectors.find(selector => selector.name === name)
  ctx.assert(selector, 404)

  ctx.set('content-type', 'text/plain')
  ctx.body = selector.content
})

export default publicAPIRouter
