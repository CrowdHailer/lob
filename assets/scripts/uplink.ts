// TODO test
declare var Ably: any;

import { getParameterByName } from "./utils.ts";

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
  static getUplinkToken(): string {
    return getParameterByName("token");
  };
  static getChannelName(){
    return getParameterByName("channel");
  };
}

export default Uplink
