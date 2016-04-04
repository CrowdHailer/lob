import { throttle } from "../utils/fn";
import { Config } from '../config';
import Device from "../lib/device";

export default function FlyerUplink(options, logger) {
  if ( !(this instanceof FlyerUplink) ) { return new FlyerUplink(options, logger); }

  logger.info('Starting uplink', options);

  var uplink = this;
  var channelName = options.channelName;

  // TODO: Remove clientId when https://github.com/ably/ably-js/issues/252 resolved
  var client = new Ably.Realtime({ authUrl: '/flyer/' + channelName + '/token', clientId: channelName });
  var channel = client.channels.get(channelName);

  /* Flights namespace is configured to persist messages */
  var flightRecorderChannelName = "flights:" + options.channelName;
  var flightRecorderChannel = client.channels.get(flightRecorderChannelName);

  var deviceType = new Device().deviceDescription();

  var noop = function() {};

  function transmitReadingAndOrientation(reading, orientation){
    channel.publish("reading", { reading: reading, orientation: orientation }, function(err) {
      if (err) {
        logger.warn("Unable to send new reading; err = " + err.message);
      }
    })
  }

  function transmitFlightData(flightData){
    flightRecorderChannel.publish("flight", flightData, function(err) {
      if (err) {
        logger.warn("Unable to send new fligth data; err = " + err.message);
      }
    })
  }

  client.connection.on("connected", function(err) {
    uplink.onconnected();
  });

  client.connection.on("disconnected", function(err) {
    logger.warn("Uplink is disconnected", err);
    uplink.onconnectionDisconnected(err);
  });

  client.connection.on("failed", function(err) {
    console.error("Connection failed", err);
    uplink.onconnectionFailed(err);
  });

  /* Be present on the channel so that subscribers know a publisher is here */
  channel.presence.enter({ device: deviceType }, function(err) {
    if (err) {
      logger.error("Could not enter presence", err);
      uplink.onconnectionFailed(err);
    } else {
      logger.info("Present on channel", channelName, ", device:", deviceType);
    }
  });

  flightRecorderChannel.attach(function(err) {
    if (err) {
      logger.error("Could not attach to flight recorder channel", flightRecorderChannelName);
    } else {
      logger.info("Attached to flight recorder channel", flightRecorderChannelName);
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

  this.transmitReadingAndOrientation = throttle(transmitReadingAndOrientation, Config.readingPublishLimit);
  this.transmitFlightData = throttle(transmitFlightData, Config.flightPublishLimit); /* never send more than one lob per second, it shouldn't happen, but just in case */
}
