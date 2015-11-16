/*jshint esnext: true */

var apiKey = "1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_";
var channelName = "test";
var realtime = new Ably.Realtime({ key: apiKey });
var channel = realtime.channels.get(channelName);

function publish(vector){
    channel.publish("accelerationEvent", vector, function(err) {
      if(err)
      console.log('Unable to publish message; err = ' + err.message);
      else
      console.log('Message successfully sent');
    });
  }

export default {
  publish: publish
};
