var _ = require('lodash')
var debug = require('debug')('jm:request')
var mysql = require('mysql2')
var Promise = require('bluebird')

var DEFAULTS = {
  host: 'localhost',
  user: 'root',
  password: 'secret',
  database: 'mhhunthelper'
}

module.exports = function (opts, req) {
  if (typeof req === 'undefined') {
    req = opts
    opts = {}
  }

  opts = _.defaults((opts || {}).mysql || {}, DEFAULTS)

  return new Promise(function (resolve, reject) {
    var connection = mysql.createConnection(opts)
    debug('requesting', req)
    connection.query(req, function (err, res, fields) {
      if (err) return reject(err)
      connection.end(function (err) {
        if (err) return reject(err)
        return resolve(res)
      })
    })
  })
}
