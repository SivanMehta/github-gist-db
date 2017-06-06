const GitHubApi = require('github')
const levelup = require('levelup')
const leveldown = require('leveldown')
const moment = require('moment')
const compression = require('./compile-database')

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
 * Private helper function that pushes to GitHub
 * given that the remoteCache is populated
 */
GHStorage.prototype.pushWithCache = function (dbname, cb) {
  // compile entire database into one files object
  const files = {}
  const gistName = dbname + '-snapshot'
  files[gistName] = { content: "Database Snapshot" }
  const description = "Last Updated " + moment().toString()
  
  // check the cache to see if there is a currently a gist for this database
  if(this.remoteCache[dbname]) {
    this.githubConnection.gists.edit({
      id: this.remoteCache[dbname],
      files: files,
      description: description
    }, (err, data) => {
      cb(err, data.data.id)
    })
  } else {
    // create a new gist if there is not one available
    this.githubConnection.gists.create({
      files: files,
      public: true,
      description: description
    }, (err, data) => {
      // cache remote ID so we can just update it in the future
      this.remoteCache[dbname] = data.data.id
      cb(err, data.data.id)
    })
  }
}

/**
 * Pushes a database to a github gist. If it has never been done before,
 * it will create a new gist to do so
 * @param {String} dbname
 * @param {Function} cb
 */
GHStorage.prototype.push = function (dbname, cb) {

  // if cache is empty, query github for authorized gists
  if(!this.remoteCache) {
    // query github for valid snapshot
    this.githubConnection.gists.getAll({}, (err, res) => {
      this.remoteCache = {}
      const isSnapshot = (gist) => Object.keys(gist.files)[0].match(/.-snapshot$/)
      const snapshots = res.data.filter(isSnapshot)
      console.log(snapshots)
      snapshots.map(gist => {
        const snapshotName = Object.keys(gist.files)[0]
        this.remoteCache[snapshotName] = gist.id
      })
      this.pushWithCache(dbname, cb)
    })
  } else {
    this.pushWithCache(dbname, cb)
  }
}

/**
 * Pulls down a remote gist of this name, replacing the local datastore
 * WARNING: This will remove everything that has not been pushed
 * @param {String} dbname
 * @param {Function} cb
 */
GHStorage.prototype.pull = function (dbname, cb) {}

module.exports = GHStorage
