const gs = require('../lib');
const config = require('./config.json');
const express = require('express');
const moment = require('moment');

var db = new gs({ token: config.token });
var app = express();
app.use(require('morgan')('dev'));

// place new value in datastore
function post (req, res) {
  const url = req.url.split('/')[1];
  const time = moment().toString();

  db.put({ dbname: config.dbname, key: url, value: time }, () => {
    res.send('Saved ' + time + ' to ' + url + ' !\n');
  });
}

// get value from datastore
function get (req, res) {
  const url = req.url.split('/')[1];

  db.get({ dbname: config.dbname, key: url }, (err, data) => {
    res.send(data);
  });
}

// save datastore to github gist
function persist (req, res) {
  db.push(config.dbname, (err, id) => {
    console.log(id);
    res.send('persisted\n');
  });
}

// update yourself with github
function update (req, res) {
  db.pull(config.dbname, (error) => {
    error ? res.sendStatus(500) : res.sendStatus(200);
  });
}

db.create(config.dbname).then(success => {
  if (success) {
    app.post('*', post);
    app.get('/persist', persist);
    app.get('/update', update);
    app.get('*', get);

    app.listen(8080, () => { console.log('Started server on port 8080!'); });
  } else {
    console.error('Could not create database');
    process.exit(0);
  }
});

// when server closes (in this case on CTRL-C)
// close down the database
function closeDB () {
  db.destroy(config.dbname);
  process.exit(0);
}

process.on('SIGINT', closeDB);
