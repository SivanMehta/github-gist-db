const gs = require('./')
const config = require('./config.json')

var db = new gs({ token: config.token })
db.listGistDescriptions(console.log)

db.create("db-somedata")
