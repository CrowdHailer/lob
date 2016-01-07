// Could also be called UplinkDriver - might be more suitable
// RESPONSIBILITY - Drive the tracker application in response to messages from the Ably uplink

/* jshint esnext: true */
export default function UplinkController(options, tracker){
  var channelName = options.channelName;
  var token = options.token;
  var realtime = new Ably.Realtime({ token: token });
  realtime.connection.on("connected", function(err) {
    // If we keep explicitly passing channel data to the controller we should pass it to the main app here
    tracker.uplinkAvailable(channelName);
  });
  realtime.connection.on("failed", function(err) {
    tracker.uplinkFailed(err);
  });
  var channel = realtime.channels.get(channelName);
  channel.subscribe("newReading", function(event){
    // new Vector(event.data);
    tracker.newReading(event.data);
  });
  channel.subscribe("resetReadings", function(_event){
    tracker.resetReadings();
  });
}

// uplink controller does very little work so it is not separated from uplink

// function Uplink(options, logger){
//   var channelName = options.channel;
//   var token = options.token;
//   var realtime = new Ably.Realtime({ token: token });
//   var channel = realtime.channels.get(channelName);
//   realtime.connection.on("connected", function(err) {
//     console.log("realtime connected");
//   });
//   realtime.connection.on("failed", function(err) {
//     console.log("realtime connection failed");
//   });
// }
