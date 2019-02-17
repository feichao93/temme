export interface Config {
  mongoUri: string
  oauthClientId: string
  port: number
  oauthCallbackPath: string
  oauthClientSecret: string
  appKeys: string[]
  mongoDb: string
}

const program = require('commander')

program
  .option('--app-key <key>', 'Application key used by koa session', 'key')
  .option('-p, --port <port>', 'Port to bind', Number, 3000)
  .option('--mongo-uri <uri>', 'Uri of mongodb', 'mongodb://mongo:27017')
  .option('--mongo-db <name>', 'Database name of mongodb', 'temme-website')
  .option('-i, --oauth-client-id <id>', 'GitHub oauth2 client id')
  .option('-s, --oauth-client-secret <secret>', 'GitHub oauth2 client secret')
  .option('--oauth-callback-path <path>', 'GitHub oauth2 callback path', '/oauth-callback')
  .parse(process.argv)

const CONFIG: Config = {
  appKeys: [program.appKey],
  mongoUri: program.mongoUri,
  mongoDb: program.mongoDb,
  port: program.port,
  oauthClientId: program.oauthClientId,
  oauthClientSecret: program.oauthClientSecret,
  oauthCallbackPath: program.oauthCallbackPath,
}

export default CONFIG
