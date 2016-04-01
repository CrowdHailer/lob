// Could also be called UplinkDriver - might be more suitable
// RESPONSIBILITY - Drive the tracker application in response to messages from the Ably uplink
import Reading from "../lib/reading";
/* jshint esnext: true */
export default function UplinkController(options, tracker){
  var realtime = new Ably.Realtime({ authUrl: '/token' });
  var channelName = options.channelName;
  var channel = realtime.channels.get(channelName);

  function uplinkPublisherPresenceUpdate() {
    channel.presence.get(function(err, members) {
      console.log("Publishing members change:", members.length);
      tracker.uplinkPresent(channelName, members.length);
    });
  }

  realtime.connection.on("connected", function(err) {
    // If we keep explicitly passing channel data to the controller we should pass it to the main app here
    tracker.uplinkAvailable(channelName);
    uplinkPublisherPresenceUpdate();
  });

  realtime.connection.on("failed", function(err) {
    tracker.uplinkFailed(err);
  });

  realtime.connection.on("disconnected", function(err) {
    tracker.uplinkDisconnected(err);
  });

  channel.subscribe("newReading", function(event){
    tracker.newReading(Reading(event.data));
  });

  channel.subscribe("newOrientation", function(event){
    tracker.newOrientation(event.data);
  });

  channel.presence.subscribe(uplinkPublisherPresenceUpdate)
}
