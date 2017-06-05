const GitHubApi = require('github')
var levelup = require('levelup')
var leveldown = require('leveldown')

function GHStorage (config) {
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
}

GHStorage.prototype.listGistDescriptions = function (cb) {
  this.githubConnection.gists.getAll({
      username: "SivanMehta"
  }, (err, res) => {
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
 * Create a new datastore with the given name
 * @param {Object} data
 * @param {String} data.key
 * @param {String} data.value
 * @param {Function} callback
 * @param {Object}
 */
GHStorage.prototype.put = function (data, callback) {
  this.dbs[data.dbname].put(data.key, data.value, callback)
}

GHStorage.prototype.get = function (data, callback) {
  this.dbs[data.dbname].get(data.key, callback)
}

module.exports = GHStorage
