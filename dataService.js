// https://data.winnipeg.ca/City-Planning/Plow-Zone-Schedule/tix9-r5tc
// https://data.winnipeg.ca/resource/gqmr-3iad.json
var snowZoneUri = "https://data.winnipeg.ca/resource/gqmr-3iad.json"

var request = require('request')
var cachedRequest = require('cached-request')(request)
var cacheDirectory = "/tmp";
cachedRequest.setCacheDirectory(cacheDirectory);
var cacheTimeMs = 3600 * 1000;
cachedRequest.setValue('ttl', cacheTimeMs);

var _ = require('underscore');
var moment = require('moment-timezone');

///////////////// OVERRIDE FOR MANUAL TESTING ////////////////
var TIME_OVERRIDE = false
var debugTime = '2018-03-08T08:00:00.000';
/////////////////////////////////////////////////////////////

var service = {
  getDataPromise() {
    return new Promise((resolve, reject) => {
      cachedRequest({url: snowZoneUri}, function(err, res, body) {
        if (err || res.statusCode != 200) {
          reject(err || `Error: ${res.statusCode} ${body}`)
        } else {
          resolve(JSON.parse(body))
        }
      })
    })
  },
  
  getBansForZonePromise(letter) {
    return new Promise((resolve, reject) => {
    this.getDataPromise()
    .catch(err => reject(err))
    .then(data =>
      {
        var filtered = _.filter(data, function(zone){ return zone.plow_zone ==  letter.toUpperCase()})
        var sorted = _.sortBy(filtered, function(zone) {
          var m = new moment.tz(zone.shift_start, "America/Winnipeg");
          // console.log(m)
          return m.unix()
        })

        if (TIME_OVERRIDE) {
          var now = new moment.tz(debugTime, "America/Winnipeg")
          console.log(now)
        } else {
          var now = new moment().tz('America/Winnipeg')  
        }

        var nextBan = _.find(sorted, function(zone){
          var m = new moment.tz(zone.shift_start, "America/Winnipeg");
          return (m.unix() - now.unix()) >= 0
        })

        var lastBan = _.find(sorted.reverse(), function(zone){
          var m = new moment.tz(zone.shift_start, "America/Winnipeg");
          return (m.unix() - now.unix()) <= 0
        })

        var currentBan = _.find(sorted, function(zone){
          var start = new moment.tz(zone.shift_start, "America/Winnipeg");
          var end = new moment.tz(zone.shift_end, "America/Winnipeg");
          return now.isBetween(start, end)
        })
        var bans = {
          "lastBan": lastBan || {},
          "nextBan": nextBan || {},
          "currentBan": currentBan || {}
        }
        return resolve(bans)
      })
    })
  },
  
  alexifyDate(dateString) {
    // Takes in date string like 2018-03-09T07:00:00.000 and returns an alexa-friendly 'humanized' date string that she can speak
    var m = new moment.tz(dateString, "America/Winnipeg")
    var l = m.format('LLLL')
    return l
  }
  
}

module.exports = service;