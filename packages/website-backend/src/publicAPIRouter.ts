import Router from 'koa-router'
import CONFIG from './config'
import { Page, Project } from './interfaces'

// 查看当前登陆用户的信息
async function getMyInfo(ctx: Router.IRouterContext) {
  const username = ctx.session.username
  if (username) {
    const user = await ctx.service.users.findOne({ username })
    ctx.body = {
      username,
      userId: user.userId,
      isAdmin: username === CONFIG.admin,
    }
  } else {
    ctx.body = { username: null, userId: -1, isAdmin: false }
  }
}

async function logout(ctx: Router.IRouterContext) {
  ctx.session = null
  ctx.status = 200
}

// 查看某个用户的个人信息
async function getUserInfo(ctx: Router.IRouterContext) {
  const username = ctx.params.username
  const userProfile = await ctx.service.users.findOne({ username })
  if (userProfile == null) {
    ctx.throw(404, '')
  }
  ctx.body = userProfile.userInfo
}

// 查看每个用户的 project 列表
async function getUserProjectList(ctx: Router.IRouterContext) {
  const username = ctx.params.username
  ctx.assert(username != null, 404)
  const userProfile = await ctx.service.users.findOne({ username })
  ctx.assert(userProfile != null, 404)
  ctx.body = await ctx.service.projects.find({ username }).toArray()
}

// 查看某个 project 的信息
async function getProject(ctx: Router.IRouterContext) {
  const { username, projectName } = ctx.params
  const user = await ctx.service.users.findOne({ username })
  ctx.assert(user != null, 404)
  const project = await ctx.service.projects.findOne({ username, name: projectName })
  ctx.assert(project, 404)

  const pages = await ctx.service.pages.find({ _id: { $in: project.pageIds } }).toArray()
  const pageById = new Map(pages.map(p => [p._id, p] as [string, Page]))
  ctx.body = {
    project,
    pages: project.pageIds.map(pageId => pageById.get(pageId)),
  }
}

// 获取推荐项目列表
async function getRecommendedProjects(ctx: Router.IRouterContext) {
  const adminConfig = await ctx.service.getAdminConfig()
  const projects: Project[] = []
  for (const { username, projectName } of adminConfig.recommendedProjects) {
    const project = await ctx.service.projects.findOne({ name: projectName, username })
    projects.push(project)
  }
  ctx.body = projects.filter(Boolean)
}

export default new Router()
  .get('/my-info', getMyInfo)
  .post('/logout', logout)
  .get('/user-info/:username', getUserInfo)
  .get('/user-info/:username/projects', getUserProjectList)
  .get('/project/:username/:projectName', getProject)
  .get('/recommended-projects', getRecommendedProjects)
