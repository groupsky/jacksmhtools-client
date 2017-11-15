var Promise = require('bluebird')
var _ = require('lodash')
var debug = require('debug')('ht:pop')
var request = require('./request')
var vars = require('./vars')

var defaults = {
  attraction: 0,
  confidence: 0
}

module.exports = function (setup, opts) {
  if (!setup) throw new Error('missing setup!')
  opts = _.defaults(opts || {}, defaults)

  setup = vars(setup)

  return Promise
    .resolve(setup)
    .then(function (setup) {
      var miceQuery = ' SELECT h.mouse_id as mid, m.name as name, count(*) as seen ' +
        ' FROM hunts h ' +
        ' JOIN mice m on (h.mouse_id = m.id) ' +
        setup.fromClause +
        ' WHERE h.attracted = 1 ' +
        setup.whereClause +
        ' GROUP BY h.mouse_id ' +
        ' ORDER BY seen desc '
      var sampleQuery = ' SELECT count(*) as huntCount ' +
        ' FROM hunts h ' +
        setup.fromClause +
        ' WHERE h.attracted = 1 ' +
        setup.whereClause

      return {
        miceQuery: miceQuery,
        sampleQuery: sampleQuery,
        values: setup.values
      }
    })
    .then(function (req) {
      return Promise.all([
        request(opts, { sql: req.miceQuery, values: req.values }),
        request(opts, { sql: req.sampleQuery, values: req.values })
      ])
    })
    .then(function (data) {
      if (data.length !== 2) throw new Error('no mice in response')
      var sample = +data[ 1 ][ 0 ].huntCount
      var total = 0
      var filtered = 0
      var filteredSeen = 0
      var res = data[ 0 ]
        .map(function (mice) {
          var seen = +mice.seen
          var ar = seen / sample
          return {
            mouse: mice.name.replace(/ Mouse$/, ''),
            attraction: ar,
            seen: seen,
            sample: sample
          }
        })
        .filter(function (mice) {
          var filter = false
          if (opts.attraction > 0 && mice.seen / sample < opts.attraction) filter = true
          if (filter) {
            filtered++
            filteredSeen += mice.seen
            return false
          }
          total += +mice.seen
          return true
        })
        .map(function (mice) {
          // correct attraction due to filtering
          mice.attraction = mice.seen / total
          return mice
        })
        .sort(function (a, b) {
          return b.attraction - a.attraction
        })
      debug('filtered %d mice with total pop %d%%', filtered, Math.round(filteredSeen / sample * 10000) / 100)
      return res
    })
}

module.defaults = defaults
