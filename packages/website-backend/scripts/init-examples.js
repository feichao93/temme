const { MongoClient } = require('mongodb')
const uuid = require('uuid/v1')
const fs = require('fs')
const path = require('path')
const program = require('commander')
const assert = require('assert')
const examples = require('./resources/examples')

const shinimaUserId = 5550931

program
  .option('--user-id <id>', 'Which user has the examples', Number, shinimaUserId)
  .option('--name <string>', 'Example project name', 'examples')
  .option('--mongo-uri <uri>', 'Uri of mongodb', 'mongodb://localhost:27017')
  .option('--mongo-db <name>', 'Database name of mongodb', 'temme-website')
  .parse(process.argv)

async function main() {
  assert(program.userId != null)

  const client = await MongoClient.connect(program.mongoUri, { useNewUrlParser: true })
  const db = client.db(program.mongoDb)

  const projects = db.collection('projects')
  const pages = db.collection('pages')

  const existed = await projects.findOne({ userId: program.userId, name: program.name })
  if (existed) {
    console.log(`示例工程 ${program.name} 已存在`)
    process.exit(0)
  }

  const now = new Date().toISOString()
  const pageIds = []
  const projectId = uuid()

  for (const { name, html, htmlFile, selector } of examples) {
    console.log('processing', name)
    const htmlContent = htmlFile
      ? fs.readFileSync(path.resolve(__dirname, 'resources/html', htmlFile), 'utf8')
      : html
    const pageId = uuid()
    await pages.insertOne({
      _id: pageId,
      projectId,
      name,
      html: htmlContent.trim(),
      selector: selector.trim(),
      updatedAt: now,
      createAt: now,
    })

    pageIds.push(pageId)
  }

  await projects.insertOne({
    _id: projectId,
    userId: program.userId,
    name: program.name,
    description: '',
    pageIds,
    createdAt: now,
    updated: now,
  })

  process.exit(0)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
