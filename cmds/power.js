var ht = require('../')
var output = require('./options/output')
var vars = require('./options/vars')

exports.command = 'power [mouse]'
exports.describe = 'compute mouse power stats'
exports.builder = function (yargs) {
  return yargs
    .positional('mouse', {
      describe: 'mice to compute power stats',
      string: true
    })
    .options(output.options)
    .option('a', {
      alias: 'arcane',
      boolean: true,
      default: false,
      description: 'Include arcane traps',
      requiresArg: false
    })
    .option('d', {
      alias: 'draconic',
      boolean: true,
      default: false,
      description: 'Include draconic traps',
      requiresArg: false
    })
    .option('f', {
      alias: 'forgotten',
      boolean: true,
      default: false,
      description: 'Include forgotten traps',
      requiresArg: false
    })
    .option('h', {
      alias: 'hydro',
      boolean: true,
      default: false,
      description: 'Include hydro traps',
      requiresArg: false
    })
    .option('l', {
      alias: 'law',
      boolean: true,
      default: false,
      description: 'Include law traps',
      requiresArg: false
    })
    .option('p', {
      alias: 'physical',
      boolean: true,
      default: false,
      description: 'Include physical traps',
      requiresArg: false
    })
    .option('r', {
      alias: 'rift',
      boolean: true,
      default: false,
      description: 'Include rift traps',
      requiresArg: false
    })
    .option('s', {
      alias: 'shadow',
      boolean: true,
      default: false,
      description: 'Include shadow traps',
      requiresArg: false
    })
    .option('t', {
      alias: 'tactical',
      boolean: true,
      default: false,
      description: 'Include tactical traps',
      requiresArg: false
    })
    .option('e', {
      alias: 'eff',
      description: 'Trap effectiveness',
      number: true,
      requiresArg: true
    })
}

exports.handler = function (argv) {
  vars.handler(argv)
  if (argv.verbose) console.log(argv)
  ht.mousePowerStats(argv.mouse, argv)
    .then(output.handler.bind(output, argv))
    .catch(console.error.bind(console))
}
