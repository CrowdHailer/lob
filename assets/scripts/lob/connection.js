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

function subscribe(eventName, callback) {
  console.log("subscribe");
  channel.subscribe(eventName, callback);
}

export default {
  publish: publish,
  subscribe: subscribe
};
