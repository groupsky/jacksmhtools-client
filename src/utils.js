var TYPE_ALIASES = {
  mice: 'mouse',
  trinket: 'charm',
  weapon: 'trap'
}
var NAME_ALIASES = {
  cheese: {
    'sb': 'SUPER|Brie+',
    'sb+': 'SUPER|Brie+',
    'toxic sb': 'Toxic SUPER|Brie+',
    'toxic sb+': 'Toxic SUPER|Brie+'
  }
}

exports.prepare = function (val) {
  return val.trim().toLowerCase()
}

exports.prepareType = function (type) {
  var res = exports.prepare(type)
  if (res in TYPE_ALIASES) return TYPE_ALIASES[ res ]
  return res
}

exports.prepareName = function (type, name) {
  type = exports.prepare(type)
  name = exports.prepare(name)

  switch (type) {
    case 'trap':
    case 'charm':
    case 'base':
    case 'cheese':
    case 'mouse':
      name = name.replace(new RegExp(' ' + type + '$', 'i'), '')
      break
  }

  if (type in NAME_ALIASES && name in NAME_ALIASES[ type ]) {
    name = NAME_ALIASES[ type ][ name ]
  }

  return name
}
