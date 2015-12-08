/* jshint esnext: true */

import { getQueryParameter } from "./utils/location";

export default function(app){
  // TODO should be from location object fetched from context;
  var channelName = getQueryParameter("channel");
  var token = getQueryParameter("token");

  app.logger.debug("initializing uplink on channel " + channelName);

  var realtime = new Ably.Realtime({ token: token });
  var channel = realtime.channels.get(channelName);
  realtime.connection.on("connected", function(err) {
    app.actions.uplinkAvailable();
  });
  realtime.connection.on("failed", function(err) {
    app.actions.failedConnection(err.reason);
  });

  channel.publish("new Reading", "reading", function(err) {
    if(err) {
      console.warn("Unable to publish message; err = " + err.message);
    } else {
      console.info("Message successfully sent");
    }
  });
  var uplink = {
    startTransmission: function(){
      console.log("opening");
    }
  };

  app.actions.startTransmitting.register(uplink.startTransmission);

  return uplink;
}
