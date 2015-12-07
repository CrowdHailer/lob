// TODO test
declare var Ably: any;

// Uplink represents a single channel
class Uplink {
  channel: any;
  actions: any;
  constructor(options, actions) {
    var token = options["token"];
    var channelName = options["channelName"];
    var realtime = new Ably.Realtime({ token: token });
    realtime.connection.on("failed", function(err) {
      actions.failedConnection(err.reason);
    });
    var uplink = this;
    realtime.connection.on("connected", function(err) {
      actions.uplinkAvailable(err.reason);
      uplink.channel = realtime.channels.get(channelName);
    });
  }
  publish(eventName, vector){
    this.channel.publish(eventName, vector, function(err) {
      if(err) {
        console.log("Unable to publish message; err = " + err.message);
      } else {
        console.log("Message successfully sent");
      }
    });
  }
  subscribe(eventName, callback) {
    this.channel.subscribe(eventName, callback);
  }
}

export default Uplink
