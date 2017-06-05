const gs = require('../')
const config = require('./config.json')
const express = require('express')
const morgan = require('morgan')
const moment = require('moment')

var db = new gs({ token: config.token })
var app = express()
app.use(require('morgan')('dev'))

function post (req, res) {
  const url = req.url.split("/")[1]
  const time = moment().toString()

  db.put({dbname: config.dbname, key: url, value: time }, () => {
    res.send('Saved ' + time + ' to ' + url + " !")
  })
}

function get (req, res) {
  const url = req.url.split("/")[1]
  
  db.get({dbname: config.dbname, key: url}, (err, data) => {
    res.send(data)
  })
}

function persist (req, res) {
  res.send('persist\n')
}

db.create(config.dbname, () => {
  app.post("*", post)
  app.get("*", get)
  app.listen(8080)
})

// when server closes (in this case on CTRL-C)
// close down the database
function closeDB() {
  db.destroy(config.dbname)
  process.exit(0)
}

process.on('SIGINT', closeDB)
