// Could also be called UplinkDriver - might be more suitable
// RESPONSIBILITY - Drive the tracker application in response to messages from the Ably uplink
import Reading from "../lib/reading";
/* jshint esnext: true */
export default function UplinkController(options, tracker){
  var channelName = options.channelName;
  var realtime = new Ably.Realtime({ authUrl: '/token' });
  realtime.connection.on("connected", function(err) {
    // If we keep explicitly passing channel data to the controller we should pass it to the main app here
    tracker.uplinkAvailable(channelName);
  });
  realtime.connection.on("failed", function(err) {
    tracker.uplinkFailed(err);
  });
  realtime.connection.on("disconnected", function(err) {
    tracker.uplinkDisconnected(err);
  });
  var channel = realtime.channels.get(channelName);
  channel.subscribe("newReading", function(event){
    tracker.newReading(Reading(event.data));
  });
  channel.subscribe("newOrientation", function(event){
    tracker.newOrientation(event.data);
  });
  channel.subscribe("resetReadings", function(_event){
    tracker.resetReadings();
  });
}
