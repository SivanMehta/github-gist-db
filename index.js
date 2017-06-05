const GitHubApi = require('github')
var levelup = require('levelup')

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
*/
GHStorage.prototype.create = function (dbname) {
  this.dbs[dbname] = levelup(dbname)
}

module.exports = GHStorage
