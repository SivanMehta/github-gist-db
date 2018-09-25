const gs = require('../lib');
const config = require('./config.json');
const moment = require('moment');

// connect to database
var db = new gs({ token: config.token });

const params = {
  dbname: 'db-something',
  key: 'Current Time',
  value: moment().toString()
};

// create the datastore
db.create(params.dbname, () => {
  // add the current time
  db.put(params, () => {
    // log the stored value to the console
    db.get({ dbname: 'db-something', key: 'Current Time' }, console.log);
  });
});
