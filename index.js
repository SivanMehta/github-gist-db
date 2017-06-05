const GitHubApi = require('github')
const levelup = require('levelup')
const leveldown = require('leveldown')
const moment = require('moment')

function GHStorage (config = {}) {
  var defaultConfig = {
    protocol: "https",
    host: "api.github.com",
    headers: {
      "user-agent": "github-storage"
    },
    Promise: require('bluebird'),
    followRedirects: false,
    timeout: 5000
  }
  Object.assign(config, defaultConfig)
  var githubConnection = new GitHubApi(config)
  githubConnection.authenticate({
    type: 'token',
    token: config.token
  })

  this.githubConnection = githubConnection
  this.dbs = {}
  this.remoteCache = {}
}

GHStorage.prototype.listGistDescriptions = function (cb) {
  this.githubConnection.gists.getAll({}, (err, res) => {
    const gists = res.data.map(d => d.description)
    cb(JSON.stringify(gists))
  })
}

/**
 * Create a new datastore with the given name
 * @param {String} dbname name of datastore
 * @param {Function} cb function of the form function (err, db) {}
 */
GHStorage.prototype.create = function (dbname, cb) {
  this.dbs[dbname] = levelup(dbname, cb)
}

/**
 * Destroys the local data store of the given name
 * @param {String} dbname
 * @param {Function} cb function of the form function (err, db) {}
 */
GHStorage.prototype.destroy = function (dbname, cb = console.error) {
  this.dbs[dbname].close(cb)
  delete this.dbs[dbname]
}

/**
 * Create a new datastore with the given name
 * @param {Object} data
 * @param {String} data.dbname
 * @param {String} data.key
 * @param {Object} data.value
 * @param {Function} callback
 */
GHStorage.prototype.put = function (data, cb) {
  this.dbs[data.dbname].put(data.key, data.value, cb)
}

/**
 * Create a new datastore with the given name
 * @param {Object} data
 * @param {String} data.dbname
 * @param {String} data.key
 * @param {Function} cb
 */
GHStorage.prototype.get = function (data, cb) {
  this.dbs[data.dbname].get(data.key, cb)
}

/**
 * Pushes a database to a github gist. If it has never been done before,
 * it will create a new gist to do so
 * @param {String} dbname
 * @param {Function} cb
 */
GHStorage.prototype.push = function (dbname, cb) {
  // if cache is empty, query github for authorized gists

  // check the cache to see if there is a currently a gist for this database

  // create a new gist if there is not one available
  const gistName = dbname + '-snapshot'
  const files = {}
  files[gistName] = { content: "Database Snapshot" }
  this.githubConnection.gists.create({
    files: files,
    public: true
  }, (err, data) => {
    // cache remote ID so we can just update it in the future
    this.remoteCache[dbname, data.data.id]
    cb(err, data.data.id)
  })
}

/**
 * Pulls down a remote gist of this name, replacing the local datastore
 * WARNING: This will remove everything that has not been pushed
 * @param {String} dbname
 * @param {Function} cb
 */
GHStorage.prototype.pull = function (dbname, cb) {}

module.exports = GHStorage
