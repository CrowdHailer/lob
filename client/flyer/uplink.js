import { throttle } from "../utils/fn";

export default function FlyerUplink(options, logger) {
  if ( !(this instanceof FlyerUplink) ) { return new FlyerUplink(options, logger); }

  logger.info('Starting uplink', options);

  var uplink = this;
  var channelName = options.channelName;
  var newReadingRateLimit = options.rateLimit;
  // TODO: Remove clientId when https://github.com/ably/ably-js/issues/252 resolved
  var client = new Ably.Realtime({ authUrl: '/flyer/' + channelName + '/token', clientId: channelName });
  var channel = client.channels.get(channelName);
  var noop = function() {};

  function transmitReading(reading){
    channel.publish('newReading', reading, function(err){
      if (err) {
        window.console.warn("Unable to send new reading; err = " + err.message);
      }
    })
  }

  function transmitOrientation(position){
    channel.publish('newOrientation', position, function(err) {
      if (err) {
        window.console.warn("Unable to send new orientation; err = " + err.message);
      }
    })
  }

  client.connection.on("connected", function(err) {
    uplink.onconnected();
  });

  client.connection.on("disconnected", function(err) {
    console.log("core disconnected");
    uplink.onconnectionDisconnected();
  });

  client.connection.on("failed", function(err) {
    uplink.onconnectionFailed(err);
  });

  /* Be present on the channel so that subscribers know a publisher is here */
  channel.presence.enter(function(err) {
    if (err) {
      console.error("Could not enter presence", err);
      uplink.onconnectionFailed(err);
    } else {
      console.log("Present on channel", channelName);
    }
  });

  /* Register leave events quickly so that Ably knows the client is gone intentionally
     as opposed to disconnected abruptly */
  window.onunload = window.onbeforeunload = function () {
    client.connection.close();
  };

  this.channelName = channelName;

  /* These callbacks events are specified by the creator of this object */
  this.onconnected = noop;
  this.onconnectionFailed = noop;
  this.onconnectionDisconnected = noop;

  this.transmitReading = throttle(transmitReading, newReadingRateLimit);
  this.transmitOrientation = throttle(transmitOrientation, newReadingRateLimit);

  this.transmitResetReadings = function() {
    channel.publish("resetReadings", {}, function(err) {
      if(err) {
        window.console.warn("Unable to send reset readings; err = " + err.message);
      }
    });
  };
}
