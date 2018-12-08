import Koa from 'koa'
import * as fs from 'fs'
import { Db, MongoClient } from 'mongodb'
import Router from 'koa-router'
import Service from './Service'
import { OAUTH_CALLBACK_PATH, PORT } from './constants'
import { exchangeOAuthData, fetchUserInfo } from './gh-utils'

function makeApp(db: Db) {
  const app = new Koa()

  const service = new Service(db)

  const router = new Router()
  router.get('/', async ctx => {
    ctx.set('content-type', 'text/html')
    ctx.body = fs.readFileSync('tests/test.html', 'utf8')
  })

  router.get(OAUTH_CALLBACK_PATH, async ctx => {
    try {
      const code = ctx.query.code
      if (code == null) {
        ctx.throw(400, 'Invalid code')
      }
      const { access_token } = await exchangeOAuthData(code)
      const userInfo = await fetchUserInfo(access_token)
      await service.updateUserProfile(userInfo.id, access_token, userInfo)
      ctx.redirect(`/@${userInfo.login}`)
    } catch (e) {
      ctx.throw(400, e.message)
    }
  })

  app.use(router.routes())

  return app
}

async function main() {
  const client = await MongoClient.connect(
    'mongodb://localhost:27017',
    { useNewUrlParser: true },
  )
  console.log('Connected successfully to mongodb')
  const db = client.db('temme-website')

  const app = makeApp(db)

  app.listen(PORT, () => {
    console.log(`Server started on :${PORT}`)
  })
}

main().catch(e => {
  throw e
})
