import archiver from 'archiver'
import Koa from 'koa'
import Router from 'koa-router'

const archiveApp = new Koa()
  .use(
    new Router()
      .get('/@:login/:rawProjectName', async ctx => {
        const { login, rawProjectName } = ctx.params
        const projectName = rawProjectName.replace(/\.zip$/, '')

        const user = await ctx.service.users.findOne({ login })
        ctx.assert(user, 404)
        const project = await ctx.service.projects.findOne({
          userId: user.userId,
          name: projectName,
        })
        ctx.assert(project, 404)

        const archive = archiver('zip', { zlib: { level: 9 } })
        ctx.set('content-type', 'application/zip')
        ctx.set('content-disposition', `attachment; filename="${projectName}.zip"`)
        ctx.body = archive

        const meta = {
          name: project.name,
          description: project.description,
          pages: [] as string[],
        }
        for (const pageId of project.pageIds) {
          const page = await ctx.service.pages.findOne({ _id: pageId })
          archive.append(Buffer.from(page.html, 'utf8'), { name: page.name + '.html' })
          archive.append(Buffer.from(page.selector, 'utf8'), { name: page.name + '.temme' })
          meta.pages.push(page.name)
        }
        archive.append(Buffer.from(JSON.stringify(meta, null, 2), 'utf8'), { name: 'meta.json' })
        archive.finalize()
      })
      .routes(),
  )
  .use(ctx => ctx.throw(404))

export default archiveApp
