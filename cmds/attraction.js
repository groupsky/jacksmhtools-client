var ht = require('../')
var output = require('./options/output')
var vars = require('./options/vars')

exports.command = 'attr'
exports.aliases = 'attraction'
exports.describe = 'compute attraction rate for setup'
exports.builder = function (yargs) {
  return yargs
    .options(output.options)
    .options(vars.options)
}

exports.handler = function (argv) {
  vars.handler(argv)
  if (argv.verbose) console.log(argv)
  ht.getAttraction(argv.vars, argv)
    .then(output.handler.bind(output, argv))
    .catch(console.error.bind(console))
}
