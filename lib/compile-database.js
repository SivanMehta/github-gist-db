/**
 * Takes a leveldb database, compresses it all into minified string
 * @param {String} dbname
 * @param {Function} cb
 */
exports.deflate = function(dbname, cb) {
  return new Promise((resolve, reject) => {
    var dump = {}
    this.dbs[dbname].createReadStream()
      .on('data', (data) => {
        dump[data.key] = data.value
      })
      .on('end', () => resolve(dump))
  })
}

function empty (datastore) {
  return new Promise((a, b) => a())
}

/**
 * Takes the given datastore and replaces its contents
 * with the string
 * @param {Object} data
 * @param {String} gistName
 * @return {Promise}
 */
exports.inflate = function(data, dbname) {
  return new Promise((resolve, reject) => {
    const gistName = dbname + '-snapshot'
    const content = JSON.parse(data.data.files[gistName].content)
    const ops = Object.keys(content).map(key => {
      return { type: 'put', key: key, value : content[key] }
    })
    debugger
    // first dump
    resolve(
      empty(this.dbs[dbname])
      .then(() => this.dbs[dbname].batch(ops))
    )
  })
}
