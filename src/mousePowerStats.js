const traps = require('../data/traps')
const _ = require('lodash')
const request = require('./request')
const bsearch = require('binary-search')
const { min, sqrt, pow, round, max } = Math

var DEFAULTS = {}

module.exports = async function (mouse, opts) {
  if (!mouse) throw new Error('missing mouse!')
  opts = _.defaults(opts || {}, DEFAULTS)

  let values = [ mouse ]
  let names = []
  for (let key in traps) {
    if (!traps.hasOwnProperty(key)) continue
    if (!Array.isArray(traps[ key ])) continue
    if (opts[ key ]) {
      traps[ key ].forEach(trap => {
        values.push(trap)
        names.push('?')
      })
    }
  }

  if (!names.length) return []

  let query = ` 
     SELECT total_power, total_luck, sum(caught) as caught, count(*) as count, sum(caught)/count(*) as perc
     FROM hunts h
     JOIN traps t on t.id = h.trap_id
     JOIN mice m on m.id = h.mouse_id
     WHERE total_power IS NOT NULL
     AND total_luck IS NOT NULL
     AND m.name = ?
     AND t.name in (${names.join(',')})
     GROUP BY total_power, total_luck
     ORDER BY count DESC
     `

  let data = await request(opts, { sql: query, values: values })

  if (opts.eff) {
    const empirical = data.map(i => i.caught).reduce(sumsq, 0)
    const maxFtcLuck = data.filter(i => i.caught < i.count).reduce((res, item) => max(res, item.total_luck), 0)
    const fake = []
    fake.length = 5000000
    const seen = data.map(i => i.count).reduce(sum)
    let res = []
    let power = bsearch(fake, { target: empirical, data }, (dummy, { target, data }, power) => {
      let predicted = compute(data, power, opts.eff)
      let minPredictedLuck = minLuck(opts.eff, power)
      let d = {
        mousePower: power,
        effectiveness: opts.eff,
        empiricalCR: 1.96 * sqrt(empirical) / seen,
        predictedCR: 1.96 * sqrt(predicted) / seen,
        minPredictedLuck,
        maxFtcLuck,
        sample: seen,
      }
      res.push(d)
      if (maxFtcLuck > minPredictedLuck) return -1
      return target - predicted
    })
    return res[res.length-1]
  }

  return data
}

function sum (s, i) { return s + i }
function sumsq (s, i) { return s + pow(i, 2) }

function calccr (trapPower, trapLuck, effectiveness, mousePower) {
  const power = trapPower * effectiveness
  const luckEff = min(2, effectiveness)
  const luck = (3 - luckEff) * pow(luckEff * trapLuck, 2)
  return min(1, (power + luck) / (power + mousePower))
}

function compute (data, mousePower, effectiveness) {
  return data.map(i => i.count * calccr(i.total_power, i.total_luck, effectiveness, mousePower)).reduce(sumsq, 0)
}

function minLuck(effectiveness, mousePower) {
  var finalEffectiveness = Math.min(effectiveness, 2);
  var minLuckSquared = (mousePower / (3 - finalEffectiveness)) / Math.pow(finalEffectiveness, 2);
  return Math.ceil(Math.sqrt(minLuckSquared));
}

module.defaults = DEFAULTS
