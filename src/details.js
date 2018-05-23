var Promise = require('bluebird')
var _ = require('lodash')
var debug = require('debug')('jm:details')
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
      var query = ' SELECT CONCAT(dt.name, ":", dv.name) as detail, count(*) as seen ' +
        ' FROM hunts h ' +
        ' JOIN hunt_details hd on (hd.hunt_id = h.id) ' +
        ' JOIN detail_types dt on (dt.id = hd.detail_type_id)' +
        ' JOIN detail_values dv on (dv.id = hd.detail_value_id)' +
        setup.fromClause +
        ' WHERE 1 = 1 ' +
        setup.whereClause +
        ' GROUP BY dt.id, dv.id ' +
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
