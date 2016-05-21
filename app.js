var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var request = require("request");

app.use(bodyParser.json());

var token = "SECRET";


app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'SECRET') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong validation token');
});



//receiving messages

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;
      // Handle a text message from this sender

      if (text === "hello" || text === "hi" || text === "Hi" || text === "Hello") {
        sendTextMessage(sender, "Hello , nice to meet you, how can I help you?");
      }

      else if (text === "gen" || text === "gen") {
        sendGenericMessage(sender);
      }

      else {
        sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
      }
    }
  }
  res.sendStatus(200);
});


//doing something with the text message, in this case sending it back

function sendTextMessage(sender, text) {
  messageData = {
    text:text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

//send a structured generic message

function sendGenericMessage(sender) {
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Hello from chatbot",
          "subtitle": "subtitle",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

app.listen(process.env.PORT);