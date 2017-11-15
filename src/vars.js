var Promise = require('bluebird')
var _ = require('lodash')
var getIdFromName = require('./getIdFromName')
var debug = require('debug')('ht:vars')

var TYPE_MAPPING = {
  base: 'base_id',
  charm: 'charm_id',
  cheese: 'cheese_id',
  location: 'location_id',
  mouse: 'mouse_id',
  stage: {
    from: ' LEFT JOIN hunt_stage hs on (h.id = hs.hunt_id) ',
    where: 'hs.stage_id'
  },
  trap: 'trap_id'
}

module.exports = function (setup) {
  return Promise
    .resolve(setup)
    .then(function (setup) {
      debug('step 1', setup)
      return Promise.props(_.mapValues(setup, function (names, type) {
        debug('step 2', type, names)
        return Promise
          .resolve(type)
          .then(function (type) {
            debug('step 3', type)
            return Promise.all(_.map(names, function (values, name) {
                debug('step 4', name, values)
                return Promise
                  .resolve(name)
                  .then(getIdFromName.bind(null, type))
                  .then(function (res) { return { name: name, id: res.id, values: values } })
              }))
              .then(function (items) {
                debug('step 5', items)
                return _.mapValues(_.keyBy(items, function (item) { return item.id }), function (item) {
                  debug('step 6', item)
                  // we don't convert the values
                  if (_.isObjectLike(item.values)) {
                    return item.values
                  }
                  // the ht queries are negative so we need to negate our request
                  return { exclude: !item.values }
                })
              })
          })
      }))
    })
    .then(function (setup) {
      var fromClause = ''
      var whereClause = ''
      var values = []

      for (var type in setup) {
        if (!setup.hasOwnProperty(type)) continue
        if (!TYPE_MAPPING[ type ]) throw new Error('Unhandled setup type "' + type + '"')

        var term = TYPE_MAPPING[ type ]
        if (term.from) {
          fromClause += term.from
          term = term.where
        }
        var include = []
        var exclude = []

        for (var id in setup[ type ]) {
          if (!setup[ type ].hasOwnProperty(id)) continue
          if (setup[ type ][ id ].exclude) {
            exclude.push(id)
          } else {
            include.push(id)
          }
        }

        if (include.length) {
          whereClause += ' AND ( ' + include.map(function (id) { return term + '=?' }).join(' OR ') + ' ) '
          values = values.concat(include)
        }

        if (exclude.length) {
          whereClause += ' AND NOT ( ' + exclude.map(function (id) { return term + '=?' }).join(' OR ') + ' ) '
          values = values.concat(exclude)
        }
      }

      return {
        fromClause: fromClause,
        whereClause: whereClause,
        values: values
      }
    })
}
