var Promise = require('bluebird')
var _ = require('lodash')
var getId = require('./id')
var debug = require('debug')('jm:vars')

var stageTerm = '? in (select stage_id from hunt_stage where hunt_stage.hunt_id = h.id)'
var detailTerm = '? in (select concat(t.name, ":", v.name) from hunt_details d join detail_types t on d.detail_type_id = t.id join detail_values v on d.detail_value_id = v.id where d.hunt_id = h.id)'
// var detailTerm = '? in (select concat(t.name, ":", v.name) from hunt_details d, detail_types t, detail_values v where d.hunt_id = h.id and d.detail_ids = concat(t.id,":",v.id))'
var prevStageTerm = '? in (select stage_id from hunt_stage where hunt_stage.hunt_id = (select max(id) from hunts where hunts.id < h.id and hunts.user_id = h.user_id))'
var prevDetailTerm = '? in (select concat(t.name, ":", v.name) from hunt_details d join detail_types t on d.detail_type_id = t.id join detail_values v on d.detail_value_id = v.id where d.hunt_id = (select max(id) from hunts where hunts.id < h.id and hunts.user_id = h.user_id))'
// var prevDetailTerm = '? in (select concat(t.name, ":", v.name) from hunt_details d, detail_types t, detail_values v where d.hunt_id = (select max(id) from hunts where hunts.id < h.id and hunts.user_id = h.user_id) and d.detail_ids = concat(t.id,":",v.id))'

var TYPE_MAPPING = {
  base: 'base_id = ?',
  charm: 'charm_id = ?',
  cheese: 'cheese_id = ?',
  location: 'location_id = ?',
  mouse: 'mouse_id = ?',
  stage: stageTerm,
  stage1: stageTerm,
  stage2: stageTerm,
  stage3: stageTerm,
  stage4: stageTerm,
  stage5: stageTerm,
  detail: detailTerm,
  detail1: detailTerm,
  detail2: detailTerm,
  detail3: detailTerm,
  detail4: detailTerm,
  detail5: detailTerm,
  pstage: prevStageTerm,
  pstage1: prevStageTerm,
  pstage2: prevStageTerm,
  pstage3: prevStageTerm,
  pstage4: prevStageTerm,
  pstage5: prevStageTerm,
  pdetail: prevDetailTerm,
  pdetail1: prevDetailTerm,
  pdetail2: prevDetailTerm,
  pdetail3: prevDetailTerm,
  pdetail4: prevDetailTerm,
  pdetail5: prevDetailTerm,
  trap: 'trap_id = ?',
  after: 'timestamp >= ?',
  before: 'timestamp <= ?'
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
            return Promise
              .all(_.map(names, function (values, name) {
                debug('step 4', name, values)
                return Promise
                  .resolve(name)
                  .then(getId.bind(null, type))
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
          whereClause += ' AND ( ' + include.map(function (id) { return term }).join(' OR ') + ' ) '
          values = values.concat(include)
        }

        if (exclude.length) {
          // Implicitly include 'null' charm ID when excluding special charms
          if (type === 'charm') {
            whereClause += ' AND ( ' + exclude.map(function (id) { return 'charm_id != ?' }).join(' AND ') + ' OR charm_id IS NULL )'
          } else {
            whereClause += ' AND NOT ( ' + exclude.map(function (id) { return term }).join(' OR ') + ' ) '
          }
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
