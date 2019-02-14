import Router from 'koa-router'
import CONFIG from '../config'

// 查看当前登陆用户的信息
async function getMyInfo(ctx: Router.IRouterContext) {
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
}

async function logout(ctx: Router.IRouterContext) {
  ctx.session = null
  ctx.status = 200
}

async function getClientId(ctx: Router.IRouterContext) {
  ctx.body = {
    clientId: CONFIG.oauthClientId,
  }
}

// 查看某个用户的个人信息
async function getUserInfo(ctx: Router.IRouterContext) {
  const login = ctx.params.login
  const userProfile = await ctx.service.users.findOne({ login })
  if (userProfile == null) {
    ctx.throw(404, '')
  }
  ctx.body = userProfile.userInfo
}

// 查看每个用户的 project 列表
async function getUserProjectList(ctx: Router.IRouterContext) {
  const login = ctx.params.login
  ctx.assert(login != null, 404)
  const userProfile = await ctx.service.users.findOne({ login })
  ctx.assert(userProfile != null, 404)
  ctx.body = await ctx.service.projects.find({ userId: userProfile.userId }).toArray()
}

// 查看某个 project 的信息
async function getProject(ctx: Router.IRouterContext) {
  const { login, projectName } = ctx.params
  const user = await ctx.service.users.findOne({ login })
  ctx.assert(user != null, 404)
  const project = await ctx.service.projects.findOne(
    { userId: user.userId, name: projectName },
    { projection: { _id: false } },
  )
  ctx.assert(project, 404)

  const pages = await ctx.service.pages
    .find({ pageId: { $in: project.pageIds } })
    .project({ _id: false })
    .toArray()
  ctx.body = { project, pages }
}

export default new Router()
  .get('/my-info', getMyInfo)
  .post('/logout', logout)
  .get('/client-id', getClientId)
  .get('/user-info/:login', getUserInfo)
  .get('/user-info/:login/projects', getUserProjectList)
  .get('/project/:login/:projectName', getProject)
