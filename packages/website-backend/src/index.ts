import Koa, { Context, Middleware } from 'koa'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
import { MongoClient } from 'mongodb'
import Router from 'koa-router'
import Service from './Service'
import { exchangeOAuthData, fetchUserInfo } from './gh-utils'
import privateAPIRouter from './privateAPIRouter'
import publicAPIRouter from './publicAPIRouter'
import CONFIG from '../config'

// extends koa context
declare module 'koa' {
  interface Context {
    service: Service
  }
}

function withService(service: Service): Middleware {
  return (ctx, next) => {
    ctx.service = service
    return next()
  }
}

async function oauthCallbackHandler(ctx: Context) {
  try {
    const code = ctx.query.code
    ctx.assert(code != null, 400, `Invalid code - ${code}`)

    const { access_token } = await exchangeOAuthData(code)
    const userInfo = await fetchUserInfo(access_token)
    await ctx.service.updateUserProfile(userInfo.id, access_token, userInfo)
    ctx.session.userId = userInfo.id
    // ctx.redirect(`/@${userInfo.login}`)
    ctx.redirect(`/login-success?user_id=${userInfo.id}&username=${userInfo.login}`)
  } catch (e) {
    ctx.throw(400, e.message)
  }
}

async function fallbackHandler(ctx: Context) {
  // TODO
  ctx.throw(404)
}

function makeApp(service: Service) {
  const app = new Koa()
  app.keys = CONFIG.appKeys

  const router = new Router()
    .get(CONFIG.oauthCallbackPath, oauthCallbackHandler)
    .use(publicAPIRouter.routes())
    .use(privateAPIRouter.routes())

  app
    .use(session(app))
    .use(withService(service))
    .use(bodyParser())
    .use(router.routes())
    // fallback-handler to support client-side routing
    .use(fallbackHandler)

  return app
}

async function main() {
  const client = await MongoClient.connect(
    CONFIG.mongoUri,
    { useNewUrlParser: true },
  )
  console.log('Connected to mongodb successfully')
  const service = new Service(client.db(CONFIG.mongoDb))

  const app = makeApp(service)

  app.listen(CONFIG.port, () => {
    console.log(`Temme-website server started on :${CONFIG.port}`)
  })
}

main().catch(e => {
  throw e
})
