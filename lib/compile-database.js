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

/**
 * Takes the given datastore and replaces its contents
 * with the string
 * @param {String} dbname
 * @param {String} str
 * @param {Function} cb
 */
exports.inflate = function(dbname, str, cb) {
  cb({ "Go" : "Knicks" })
}
