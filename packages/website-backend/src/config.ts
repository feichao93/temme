export interface Config {
  appKeys: string[]
  port: number
  admin: string
  mongoUri: string
  mongoDb: string
  oauthClientId: string
  oauthClientSecret: string
  oauthCallbackPath: string
}

const program = require('commander')

program
  .option('--app-key <key>', 'Application key used by koa session', 'key')
  .option('-p, --port <port>', 'Port to bind', Number, 3000)
  .option('--admin <name>', 'The github username of website administrator')
  .option('--mongo-uri <uri>', 'Uri of mongodb', 'mongodb://mongo:27017')
  .option('--mongo-db <name>', 'Database name of mongodb', 'temme-website')
  .option('-i, --oauth-client-id <id>', 'GitHub oauth2 client id')
  .option('-s, --oauth-client-secret <secret>', 'GitHub oauth2 client secret')
  .option('--oauth-callback-path <path>', 'GitHub oauth2 callback path', '/oauth-callback')
  .parse(process.argv)

const CONFIG: Config = {
  appKeys: [program.appKey],
  port: program.port,
  admin: program.admin,
  mongoUri: program.mongoUri,
  mongoDb: program.mongoDb,
  oauthClientId: program.oauthClientId,
  oauthClientSecret: program.oauthClientSecret,
  oauthCallbackPath: program.oauthCallbackPath,
}

export default CONFIG
