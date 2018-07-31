var request = require('request');
var schedule = require('node-schedule');


module.exports = function(app) {

    //
    // GET /bot
    //
    app.get('/webhook', function(request, response) {
        if (request.query['hub.mode'] === 'subscribe' && 
            request.query['hub.verify_token'] === process.env.BOT_VERIFY_TOKEN) {            
            console.log("Validating webhook");
            response.status(200).send(request.query['hub.challenge']);
        } else {
            console.error("Failed validation. Make sure the validation tokens match.");
            response.sendStatus(403);          
        }  
    });

    //
    // POST /bot
    //
    app.post('/webhook', function(request, response) {
       var data = request.body;
       console.log('received bot webhook');
        // Make sure this is a page subscription
        if (data.object === 'page') {
            // Iterate over each entry - there may be multiple if batched
            data.entry.forEach(function(entry) {
               var pageID = entry.id;
               var timeOfEvent = entry.time;
                // Iterate over each messaging event
                entry.messaging.forEach(function(event) {
                    if (event.message) {
                        receivedMessage(event);
                    } else if (event.game_play) {
                        receivedGameplay(event);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
                });
            });
        }
        response.sendStatus(200);
    });

    //
    // Handle messages sent by player directly to the game bot here
    //
    function receivedMessage(event) {
      
    }

    //
    // Handle game_play (when player closes game) events here. 
    //
    function receivedGameplay(event) {
        // Page-scoped ID of the bot user
        var senderId = event.sender.id; 

        // FBInstant player ID
        var playerId = event.game_play.player_id; 

        // FBInstant context ID 
        var contextId = event.game_play.context_id;

        // Check for payload
        if (event.game_play.payload) {
            //
            // The variable payload here contains data set by
            // FBInstant.setSessionData()
            //
            var payload = JSON.parse(event.game_play.payload);

            // In this example, the bot is just "echoing" the message received
            // immediately. In your game, you'll want to delay the bot messages
            // to remind the user to play 1, 3, 7 days after game play, for example.
			//gui tin nhan lan dau
			sendMessage(senderId, contextId, "" + payload.message1, "Play now!", payload.ulrImage1,payload.subtitleIV);
			var numberRepeat=0;
			//numberRepeat=0;
			var rule = new schedule.RecurrenceRule();
			rule.dayOfWeek = [0,1,6];
			rule.hour = 10;
			rule.minute = 0;
			//rule.second=0;

			var job = schedule.scheduleJob(rule, function(){
			 // numberRepeat++;
			  numberRepeat++;
			  if(numberRepeat===1)
			  {
				  sendMessage(senderId, contextId, "" + payload.message2, "Play now!", payload.ulrImage2,"");
			  }
			  else if(numberRepeat===2)
			  {
				  sendMessage(senderId, contextId, "" + payload.message3, "Play now!", payload.ulrImage3,"");
			  }
			  else if(numberRepeat===3)
			  {
				  sendMessage(senderId, contextId, "" + payload.message4, "Play now!", payload.ulrImage4,"");
			  }
			  else if(numberRepeat>=4)
			  {
				job.cancel();
			  }
			});
            
        }
    }

    //
    // Send bot message
    //
    // player (string) : Page-scoped ID of the message recipient
    // context (string): FBInstant context ID. Opens the bot message in a specific context
    // message (string): Message text
    // cta (string): Button text
    // payload (object): Custom data that will be sent to game session
    // 
    function sendMessage(player, context, messageClient, cta, payloadUrlImage,subtitleIV) {
        var button = {
            type: "game_play",
            title: cta
        };

       // if (context) {
       //     button.context = context;
        //}
       // if (payload) {
       //    button.payload = JSON.stringify(payload)
        //}
        var messageData = {
            recipient: {
                id: player
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [
                        {
                            title: messageClient,
							image_url: payloadUrlImage,
							subtitle:subtitleIV,
                            buttons: [button]
                        }
                        ]
                    }
                }
            }
        };

        callSendAPI(messageData);

    }

    function callSendAPI(messageData) {
        var graphApiUrl = 'https://graph.facebook.com/me/messages?access_token='+process.env.PAGE_ACCESS_TOKEN
        request({
            url: graphApiUrl,
            method: "POST",
            json: true,  
            body: messageData
        }, function (error, response, body){
            console.error('send api returned', 'error', error, 'status code', response.statusCode, 'body', body);
        });
    }

}