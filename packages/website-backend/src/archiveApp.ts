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

        for (const folder of project.folders) {
          for (const selectorId of folder.selectorIds) {
            const selector = await ctx.service.selectors.findOne({ selectorId })
            const selectorName = selector.name.endsWith('.temme')
              ? selector.name
              : selector.name + '.temme'
            const zipPath = { prefix: folder.name, name: selectorName }
            archive.append(Buffer.from(selector.content, 'utf8'), zipPath)
          }

          for (const htmlId of folder.htmlIds) {
            const html = await ctx.service.htmls.findOne({ htmlId })
            const htmlName = html.name.endsWith('.html') ? html.name : html.name + '.html'
            const zipPath = { prefix: folder.name, name: htmlName }
            archive.append(Buffer.from(html.content, 'utf8'), zipPath)
          }
        }
        archive.finalize()
      })
      .routes(),
  )
  .use(ctx => ctx.throw(404))

export default archiveApp
