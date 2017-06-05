const gs = require('../')
const config = require('./config.json')
const express = require('express')
const morgan = require('morgan')

var db = new gs({ token: config.token })
var app = express()
app.use(require('morgan')('dev'))

function post (req, res) {
  res.send('post\n')
}

function get (req, res) {
  res.send('get\n')
}

function persist (req, res) {
  res.send('persist\n')
}

db.create(config.dbname, () => {
  app.post("*", post)
  app.get("*", get)
  app.listen(8080)
})

function closeDB() {
  db.destroy(config.dbname)
  process.exit(0)
}

process.on('SIGINT', closeDB)
