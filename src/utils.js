var TYPE_ALIASES = {
  mice: 'mouse',
  trinket: 'charm',
  weapon: 'trap'
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

  return name
}
