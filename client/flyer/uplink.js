import { throttle } from "../utils/fn";

export default function FlyerUplink(options, logger) {
  if ( !(this instanceof FlyerUplink) ) { return new FlyerUplink(options, logger); }

  logger.info('Starting uplink', options);

  var uplink = this;
  var channelName = options.channelName;
  var newReadingRateLimit = options.rateLimit;
  var client = new Ably.Realtime({ authUrl: '/flyer/' + channelName + '/token' });
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
    uplink.onconnectionFailed();
  });

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

  this.transmitIdentity = function() {
    // TODO update identity
  }
}
