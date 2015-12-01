// TODO test
declare var Ably: any;

// Uplink represents a single channel
class Uplink {
  channel: any;
  constructor(options) {
    var token = options["token"];
    var channelName = options["channelName"];
    var realtime = new Ably.Realtime({ token: token });
    realtime.connection.on("failed", function() {
      alert("failed to connect");
    });
    this.channel = realtime.channels.get(channelName);
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
  static getUplinkKey(): string{
    var match = window.location.hash.match(/#(.+)/);
    if (match) {
      return match[1];
    }
  };
  static getChannelName(){
    var regex = /^\/([^\/]+)/;
    var match = window.location.pathname.match(regex);
    if (match) {
      return match[1];
    }
  };
}

export default Uplink
