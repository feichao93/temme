import Router from 'koa-router'
import CONFIG from './config'

async function requireAdmin(ctx: Router.IRouterContext, next: any) {
  const userId: number = ctx.session.userId
  ctx.assert(userId && userId !== -1, 401, 'Require signed in')
  const user = await ctx.service.users.findOne({ userId })
  ctx.assert(user && user.login === CONFIG.admin, 401, 'Require admin signed in.')
  return next()
}

async function listUsers(ctx: Router.IRouterContext) {
  const skip = Number(ctx.query.skip || 0)
  const limit = Number(ctx.query.limit || 10)
  const users: any[] = await ctx.service.users
    .find({})
    .skip(skip)
    .limit(limit)
    .toArray()
  for (const user of users) {
    user.projects = await ctx.service.projects.find({ userId: user.userId }).toArray()
  }
  ctx.body = users
}

async function banProject(ctx: Router.IRouterContext) {
  ctx.throw(400, '仍在实现中')
}

async function banUser(ctx: Router.IRouterContext) {
  ctx.throw(400, '仍在实现中')
}

export default new Router({ prefix: '/admin' })
  .use(requireAdmin)
  .get('/list-users', listUsers)
  .post('/ban-project', banProject)
  .post('/ban-user', banUser)
