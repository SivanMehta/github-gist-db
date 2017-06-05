const gs = require('./')
const config = require('./config.json')

var db = new gs({ token: config.token })

const data = {
  dbname: 'db-something',
  key: 'Go',
  value: 'Knicks'
}

db.create(data.dbname)
db.put(data)
db.get(data, console.log)
