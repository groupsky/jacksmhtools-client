var Promise = require('bluebird')
var utils = require('./utils')
var request = require('./request')

var MAPPING = {
  base: 'bases',
  charm: 'charms',
  cheese: 'cheese',
  location: 'locations',
  item: 'loot',
  loot: 'loot',
  mouse: 'mice',
  mice: 'mice',
  stage: 'stages',
  stage1: 'stages',
  stage2: 'stages',
  stage3: 'stages',
  stage4: 'stages',
  stage5: 'stages',
  trap: 'traps',
  weapon: 'weapon'
}

module.exports = function (type, name, opts) {
  if (!type) throw new Error('missing type!')
  if (!name) throw new Error('missing name!')

  // if we are asked for id instead of name, just return it
  // if (!Number.isNaN(+name)) return Promise.resolve({ id: +name })

  if (type.substr(0, 6) === 'detail') return Promise.resolve({id: name})
  if (type === 'after') return Promise.resolve({id: +name})
  type = utils.prepareType(type)
  name = utils.prepareName(type, name)

  return Promise
    .try(function () {
      if (!MAPPING[ type ]) throw new Error('unknown type "' + type + '"')

      return request(opts, {
        sql: 'SELECT id FROM ' + MAPPING[ type ] + ' WHERE `name` like ?',
        values: [ name ]
      })
    })
    .then(function (results) {
      if (results.length === 0) throw new Error('Cannot find ' + name)
      return results[ 0 ]
    })
}
