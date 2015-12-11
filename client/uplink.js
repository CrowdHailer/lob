/* jshint esnext: true */

import { getQueryParameter } from "./utils/location";

export default function(app){
  // TODO should be from location object fetched from context;
  var channelName = getQueryParameter("channel");
  var token = getQueryParameter("token");

  var channel;
  function start(){
    console.debug("initializing uplink on channel " + channelName);

    var realtime = new Ably.Realtime({ token: token });
    channel = realtime.channels.get(channelName);
    realtime.connection.on("connected", function(err) {
      app.uplinkAvailable();
    });
    realtime.connection.on("failed", function(err) {
      app.uplinkFailed(err.reason);
    });
    app.onStartTransmitting(uplink.startTransmitting);
  }

  // channel.publish("new Reading", "reading", function(err) {
  //   if(err) {
  //     console.warn("Unable to publish message; err = " + err.message);
  //   } else {
  //     console.info("Message successfully sent");
  //   }
  // });
  var uplink = {
    startTransmitting: function(){
      console.log(app.uplinkStatus);
    },
    newReading: function(r){
      console.log("what is the new reading", r);
      console.log("what is the state", app.fetchService("store").state.uplink.transmitting);
    },
    // TODO start should be callable once
    start: start
  };

  // app.actions.newReading.register(uplink.newReading);

  return uplink;
}
