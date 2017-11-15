var client = require('../')
var output = require('./options/output')

exports.command = 'id <type> <name>'
exports.describe = 'get the id of item named "name"'
exports.builder = function (yargs) {
  return yargs
    .options(output.options)
    .positional('type', {
      choices: [ 'loot', 'location', 'mouse', 'trap', 'weapon', 'base', 'cheese', 'charm', 'trinket' ],
      describe: 'type of item'
    })
    .positional('name', {
      describe: 'name of item'
    })
}

exports.handler = function (argv) {
  if (argv.verbose) console.info('getting id of ' + argv.type + ' "' + argv.name + '"')
  client.getIdFromName(argv.type, argv.name, argv)
    .then(output.handler.bind(output, argv))
      .catch(console.error.bind(console))
}
