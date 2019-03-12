import * as fs from 'fs'
import Koa, { Context, Middleware } from 'koa'
import koaBody from 'koa-body'
import compress from 'koa-compress'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import mount from 'koa-mount'
import Router from 'koa-router'
import session from 'koa-session'
import serve from 'koa-static'
import { MongoClient } from 'mongodb'
import adminAPIRouter from './adminAPIRouter'
import archiveApp from './archiveApp'
import CONFIG from './config'
import { exchangeOAuthData, fetchUserInfo } from './gh-utils'
import privateAPIRouter from './privateAPIRouter'
import publicAPIRouter from './publicAPIRouter'
import Service from './Service'

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

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
    ctx.session.username = userInfo.login

    const searchParams = new URLSearchParams()
    searchParams.set('userId', String(userInfo.id))
    searchParams.set('username', userInfo.login)
    if (userInfo.login === CONFIG.admin) {
      searchParams.set('isAdmin', '')
    }

    ctx.redirect(`/login-success?${searchParams}`)
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

  app
    .use(compress({ threshold: 2048 }))
    .use(conditional())
    .use(etag())
    .use(session(app))
    .use(withService(service))
    .use(koaBody({ multipart: true }))
    .use(mount('/static', staticApp))
    .use(mount('/archive', archiveApp))
    .use(
      new Router()
        .get(CONFIG.oauthCallbackPath, oauthCallbackHandler)
        .get('/oauth-request', ctx => {
          ctx.redirect(`https://github.com/login/oauth/authorize?client_id=${CONFIG.oauthClientId}`)
        })
        .routes(),
    )
    .use(
      mount(
        '/api',
        new Koa()
          .use(publicAPIRouter.routes())
          .use(privateAPIRouter.routes())
          .use(adminAPIRouter.routes())
          .use(ctx => ctx.throw(404)),
      ),
    )
    .use(fallbackHandler)

  return app
}

async function main() {
  let client: MongoClient
  let retryCount = 0
  while (true) {
    try {
      client = await MongoClient.connect(CONFIG.mongoUri, { useNewUrlParser: true })
      console.log('Connected to mongodb successfully')
      break
    } catch (e) {
      retryCount++
      if (retryCount === 10) {
        throw e
      }
      console.error(`Connect to mongo fail. Retrying ${retryCount}/10`)
      await wait(300)
    }
  }
  const service = new Service(client.db(CONFIG.mongoDb))

  const app = makeApp(service)

  app.listen(CONFIG.port, () => {
    console.log(`Temme-website server started on :${CONFIG.port}`)
  })
}

main().catch(e => {
  throw e
})
