const GitHubApi = require('github')

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
  this.dbConnection = require('levelup')
}

GHStorage.prototype.listGistDescriptions = function (cb) {
  this.githubConnection.gists.getAll({
      username: "SivanMehta"
  }, (err, res) => {
    const users = res.data.map(d => d.description)
    cb(JSON.stringify(users))
  })
}

module.exports = GHStorage
