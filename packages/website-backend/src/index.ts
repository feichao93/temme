import * as fs from 'fs'
import Koa, { Context, Middleware } from 'koa'
import bodyParser from 'koa-bodyparser'
import compress from 'koa-compress'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import mount from 'koa-mount'
import Router from 'koa-router'
import session from 'koa-session'
import serve from 'koa-static'
import { MongoClient } from 'mongodb'
import CONFIG from '../config'
import archiveApp from './archiveApp'
import { exchangeOAuthData, fetchUserInfo } from './gh-utils'
import privateAPIRouter from './privateAPIRouter'
import publicAPIRouter from './publicAPIRouter'
import Service from './Service'

const ONE_YEAR = 365 * 24 * 3600 * 1000

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
    ctx.redirect(`/login-success?user_id=${userInfo.id}&username=${userInfo.login}`)
  } catch (e) {
    ctx.throw(400, e.message)
  }
}

async function fallbackHandler(ctx: Context) {
  ctx.set('content-type', 'text/html')
  ctx.body = fs.createReadStream('public/index.html')
}

const staticApp = new Koa()
  .use(serve('public/static', { maxage: ONE_YEAR }))
  .use(ctx => ctx.throw(404))

function makeApp(service: Service) {
  const app = new Koa()
  app.keys = CONFIG.appKeys

  const router = new Router()
    .get(CONFIG.oauthCallbackPath, oauthCallbackHandler)
    // TODO .use(mount('/api', apiApp))
    .use(publicAPIRouter.routes())
    .use(privateAPIRouter.routes())

  app
    .use(compress({ threshold: 2048 }))
    .use(conditional())
    .use(etag())
    .use(session(app))
    .use(withService(service))
    .use(bodyParser())
    .use(mount('/static', staticApp))
    .use(mount('/archive', archiveApp))
    .use(router.routes())
    .use(fallbackHandler)

  return app
}

async function main() {
  const client = await MongoClient.connect(CONFIG.mongoUri, { useNewUrlParser: true })
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
