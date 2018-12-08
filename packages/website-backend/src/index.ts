import Koa, { Context, Middleware } from 'koa'
import * as fs from 'fs'
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
    if (code == null) {
      ctx.throw(400, 'Invalid code')
    }
    const { access_token } = await exchangeOAuthData(code)
    const userInfo = await fetchUserInfo(access_token)
    await ctx.service.updateUserProfile(userInfo.id, access_token, userInfo)
    ctx.session.userId = userInfo.id
    ctx.redirect(`/@${userInfo.login}`)
  } catch (e) {
    ctx.throw(400, e.message)
  }
}

async function fallbackHandler(ctx: Context) {
  ctx.set('content-type', 'text/html')
  ctx.body = fs.readFileSync('tests/test.html', 'utf8')
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
    .use(fallbackHandler)

  return app
}

async function main() {
  const client = await MongoClient.connect(
    CONFIG.mongoUri,
    { useNewUrlParser: true },
  )
  console.log('Connected successfully to mongodb')
  const db = client.db('temme-website')
  const service = new Service(db)

  const app = makeApp(service)

  app.listen(CONFIG.port, () => {
    console.log(`Server started on :${CONFIG.port}`)
  })
}

main().catch(e => {
  throw e
})
