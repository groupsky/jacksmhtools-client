var Promise = require('bluebird')
var _ = require('lodash')
var request = require('./request')
var vars = require('./vars')

var DEFAULTS = {
  min_chance: 0,
  min_qty: 0,
  include_items: [],
  exclude_items: []
}

module.exports = function (setup, opts) {
  if (!setup) throw new Error('missing setup!')
  opts = _.defaults(opts || {}, DEFAULTS)
  if (!Array.isArray(opts.include_items)) opts.include_items = [ opts.include_items ]
  if (!Array.isArray(opts.exclude_items)) opts.exclude_items = [ opts.exclude_items ]

  setup = vars(setup)

  return Promise
    .resolve(setup)
    .then(function (setup) {
      var queryLoots = 'SELECT hl.loot_id as loot_id, l.name as name, sum(hl.amount) as quant, count(hl.hunt_id) as dropped' +
        ' FROM hunts h' +
        ' JOIN hunt_loot hl on (h.id = hl.hunt_id) ' +
        ' LEFT JOIN loot l on (hl.loot_id = l.id) ' +
        setup.fromClause +
        ' WHERE h.caught = 1 ' +
        ' AND h.extension_version >= 11107 ' +
        setup.whereClause +
        ' GROUP BY hl.loot_id' +
        ' ORDER BY dropped desc'

      var querySample = 'SELECT count(*) as totalCaught' +
        ' FROM hunts h ' +
        setup.fromClause +
        ' WHERE h.caught = 1 ' +
        ' AND h.extension_version >= 11107 ' +
        setup.whereClause

      return {
        loots: queryLoots,
        sample: querySample,
        values: setup.values
      }
    })
    .then(function (req) {
      return Promise.all([
        request(opts, { sql: req.loots, values: req.values }),
        request(opts, { sql: req.sample, values: req.values })
      ])
    })
    .then(function (data) {
      if (data.length !== 2) throw new Error('no loot in response')
      var sample = +data[ 1 ][ 0 ].totalCaught
      var res = data[ 0 ]
        .map(function (loot) {
          var lootId = +loot.loot_id
          var name = loot.name
          var quantity = +loot.quant
          var dropTimes = +loot.dropped
          return {
            id: lootId,
            name: name,
            chance: dropTimes / sample,
            total: quantity,
            avgPerCatch: quantity / sample,
            avgPerDrop: quantity / dropTimes,
            sample: sample
          }
        })
        .filter(function (loot) {
          if (loot.chance < opts.min_chance) return false
          if (loot.avgPerCatch < opts.min_qty) return false
          if (opts.include_items.length) {
            if (!_.includes(opts.include_items, loot.name)) return false
          }
          if (_.includes(opts.exclude_items, loot.name)) return false
          return true
        })
        .sort(function (a, b) {
          return b.chance - a.chance
        })
      return res
    })
}

module.defaults = DEFAULTS
