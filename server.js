const express = require('express');
const app = express();
const alexa = require('alexa-app');
var alexaApp = new alexa.app('know-your-zone');
var dataService = require('./dataService');
const http = require('http');

                
alexaApp.express({
  expressApp: app,
  checkCert: true,
  debug: false
});

app.get('/', function(request, response) {
  dataService.getDataPromise()
    .catch(error => response.status(500).json({'status':'error','message':error}))
    .then(data => response.json(data))
});

app.get('/zone/:id', function(request, response) {
  dataService.getBansForZonePromise(request.params.id)
    .catch(error => response.status(500).json({'status':'error','message':error}))
    .then(data => response.json(data))
});

alexaApp.launch(function(request, response) {
  var welcomeMessage = "Welcome to snow zone. You can ask me to get you parking info for your designated parking zone. Visit winnipeg.ca/snow to find out which zone you are in. Which parking zone would you like information for?"
  var reprompt = "Which parking zone would you like information for?";
  response.say(welcomeMessage).reprompt(reprompt).shouldEndSession(false);
});

alexaApp.intent("GetZoneInfoIntent", {
  "dialog": {
    type: "delegate"
  },
  "slots": {
    "letter": "LetterSlot"
  },
  "utterances": [],
  },
  function(request, response) {
    if (request.getDialog().isStarted() || request.getDialog().isInProgress()) {
      request.getDialog().handleDialogDelegation();
    } else if (request.getDialog().isCompleted()){
      var zoneLetter = request.slot('letter');
      zoneLetter = zoneLetter.substring(0,1)
      return dataService.getBansForZonePromise(zoneLetter)
        .catch(error => console.log(error))  
        .then(ban => {
        console.log(ban) 
        if (ban.currentBan.shift_start) {
          // Currently in a ban for this zone
          response.say(`There is currently an ongoing parking ban for zone <say-as interpret-as="spell-out">${zoneLetter}</say-as>. It started on ${dataService.alexifyDate(ban.currentBan.shift_start)} and ends on ${dataService.alexifyDate(ban.currentBan.shift_end)}`).shouldEndSession(true)
        } else if (ban.nextBan.shift_start) {
          response.say(`The next upcoming parking ban for zone <say-as interpret-as="spell-out">${zoneLetter}</say-as> <break time=".3s"/>  starts at ${dataService.alexifyDate(ban.nextBan.shift_start)} and ends at ${dataService.alexifyDate(ban.nextBan.shift_end)}`).shouldEndSession(true)
        } else {
          response.say(`I didn't find any ongoing or upcoming parking bans for zone <say-as interpret-as="spell-out">${zoneLetter}</say-as>. To double check your zone letter, visit winnipeg.ca/snow`).shouldEndSession(true);
        }
        response.send()
      })
    }
  }
);

alexaApp.error = function(exception, request, response) {
  response.say("Sorry, an error occurred");
};

alexaApp.intent("AMAZON.HelpIntent", {
    "slots": {},
    "utterances": []
  },
  function(request, response) {
    var helpOutput = "You can ask for parking ban information like this: <break time='.2s'/> Alexa, ask snow zone if there is a parking ban for zone H'. <break time='.2s'/> Visit winnipeg.ca/snow to discover which zone you are in. <break time='.2s'/> What zone would you like information for?";
    var reprompt = "Which parking zone would you like information for?";
    response.say(helpOutput).reprompt(reprompt).shouldEndSession(false);
  }
);

const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Keep the app alive plz
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);