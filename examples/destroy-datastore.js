// make sure that the database is already created
const gs = require('../')
const config = require('./config.json')
const moment = require('moment')

// connect to database
var db = new gs({token: 'lol'})
const dbname =  'db-something'

db.destroy('db-something', console.error)
