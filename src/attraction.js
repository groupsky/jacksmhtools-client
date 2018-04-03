var Promise = require('bluebird')
var _ = require('lodash')
var debug = require('debug')('ht:attraction')
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
      var query = ' SELECT h.attraction_bonus, SUM(h.attracted)/COUNT(*) as attraction, COUNT(*) as sample ' +
        ' FROM hunts h ' +
        setup.fromClause +
        ' WHERE h.attraction_bonus IS NOT NULL ' +
        ' AND h.attraction_bonus < 100 ' +
        setup.whereClause +
        ' GROUP BY attraction_bonus'

      return {
        query: query,
        values: setup.values
      }
    })
    .then(function (req) {
      return request(opts, {sql: req.query, values: req.values})
    })
    .then(function (data) {
      if (data.length < 1) throw new Error('no results')
      return data.reduce(function (agg, item) {
        var attractionBonus = item.attraction_bonus / 100
        agg.sample += item.sample
        agg.attracted += item.sample * (item.attraction - attractionBonus) / (1 - attractionBonus)
        agg.raw_attracted += item.attraction * item.sample
        return agg
      }, {sample: 0, attracted: 0, raw_attracted: 0})
    })
    .then(function (data) {
      if (data.sample === 0) throw new Error('unable to determine')
      return {
        attraction: data.attracted / data.sample,
        raw_attraction: data.raw_attracted / data.sample,
        sample: data.sample
      }
    })
}

module.defaults = defaults
