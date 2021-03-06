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

/**
 * Create a new datastore with the given name
 * and create a remoteCache for snapshot currently
 * stored in Github Gist
 * @param {String} dbname name of datastore
 * @return {Function} Promise success of database creation
 */
GHStorage.prototype.create = function (dbname) {
  return new Promise((resolve, reject) => {
    this.dbs[dbname] = levelup(dbname)
    this.githubConnection.gists.getAll({}).then((res) => {
      const isSnapshot = (gist) => Object.keys(gist.files)[0].match(/.-snapshot$/)
      const snapshots = res.data.filter(isSnapshot)
      this.remoteCache = {}
      if(snapshots.length > 0) {
        snapshots.map(gist => {
          const snapshotName = Object.keys(gist.files)[0]
          this.remoteCache[snapshotName] = gist.id
        })
        resolve(true)
      }
    })
  })
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
  // compile entire database into one files object
  this.files = {}
  const gistName = dbname + '-snapshot'
  this.deflate(dbname).then(data => {
    this.files[gistName] = { content: JSON.stringify(data) }
    const description = "Last Updated " + moment().toString()

    // check the cache to see if there is a currently a gist for this database
    if(this.remoteCache[gistName]) {
      this.githubConnection.gists.edit({
        id: this.remoteCache[gistName],
        files: this.files,
        description: description
      }, (err, data) => {
        cb(err, data.data.id)
      })
    } else {
      // create a new gist if there is not one available
      this.githubConnection.gists.create({
        files: this.files,
        public: true,
        description: description
      }, (err, ghData) => {
        // cache remote ID so we can just update it in the future
        this.remoteCache[gistName] = ghData.data.id
        cb(err, ghData.data.id)
      })
    }
  })
}

/**
 * Pulls down a remote gist of this name, replacing the local datastore
 * WARNING: This will remove everything that has not been pushed
 * @param {String} dbname
 * @param {Function} cb
 */
GHStorage.prototype.pull = function (dbname, cb) {
  const gistName = dbname + '-snapshot'
  // check if there is a remote repository corresponding
  // to this datastore
  if(this.remoteCache && this.remoteCache[gistName]) {
    this.githubConnection.gists
      .get({ id : this.remoteCache[gistName]})
      .then((data) => this.inflate(data, dbname))
      .then(() => cb(true))
  } else {
    cb(false)
  }
}

GHStorage.prototype.inflate = compression.inflate
GHStorage.prototype.deflate = compression.deflate

module.exports = GHStorage
