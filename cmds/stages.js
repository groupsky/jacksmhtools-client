var ht = require('../')
var output = require('./options/output')
var vars = require('./options/vars')

exports.command = 'stages'
exports.describe = 'list stages for setup'
exports.builder = function (yargs) {
  return yargs
    .options(output.options)
    .options(vars.options)
}

exports.handler = function (argv) {
  vars.handler(argv)
  if (argv.verbose) console.log(argv)
  ht.getStages(argv.vars, argv)
    .then(output.handler.bind(output, argv))
    .catch(console.error.bind(console))
}
