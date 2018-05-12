module.exports.getId = require('./src/id')
module.exports.getLoot = require('./src/loot')
module.exports.getPopulation = require('./src/population')
module.exports.calcMousePower = require('./src/mousePower')
module.exports.getAttraction = require('./src/attraction')
module.exports.getStages = require('./src/stages')

/**
 * @deprecated
 * Renamed to getId
 */
module.exports.getIdFromName = require('./src/id')
/**
 * @deprecated
 * Renamed to getLoot
 */
module.exports.getLootFoundData = require('./src/loot')
/**
 * @deprecated
 * Renamed to getPopulation
 */
module.exports.getSAEncounterRateData = require('./src/population')
/**
 * @deprecated
 * Renamed to calcMousePower
 */
module.exports.mousePowerStats = require('./src/mousePower')
