var Promise = require('bluebird')
var _ = require('lodash')
var debug = require('debug')('jm:stages')
var request = require('./request')
var vars = require('./vars')

var defaults = {}

module.exports = function (setup, opts) {
  if (!setup) throw new Error('missing setup!')
  opts = _.defaults(opts || {}, defaults)

  setup = vars(setup)

  return Promise
    .resolve(setup)
    .then(function (setup) {
      var query = ' SELECT s.name as name, count(*) as seen ' +
        ' FROM hunts h ' +
        ' JOIN hunt_stage hs on (hs.hunt_id = h.id) ' +
        ' JOIN stages s on (s.id = hs.stage_id)' +
        setup.fromClause +
        ' WHERE 1 = 1 ' +
        setup.whereClause +
        ' GROUP BY s.id ' +
        ' ORDER BY seen desc '

      return {
        query: query,
        values: setup.values
      }
    })
    .then(function (req) {
      debug('query', req.query, req.values)
      return request(opts, {sql: req.query, values: req.values})
    })
}

module.defaults = defaults
