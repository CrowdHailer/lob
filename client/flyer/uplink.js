import { throttle } from "../utils/fn";

export default function FlyerUplink(options, logger) {
  if ( !(this instanceof FlyerUplink) ) { return new FlyerUplink(options, logger); }
  var uplink = this;
  logger.info('Starting uplink', options);

  var channelName = options.channelName;
  var token = options.token;
  var newReadingRateLimit = options.rateLimit;
  var client = new Ably.Realtime({ token: token });
  var channel = client.channels.get(channelName);
  this._ablyClient = client;
  this._ablyChannel = channel;
  this.token = token;
  this.channelName = channelName;
  this.newReadingRateLimit = newReadingRateLimit;
  
  this.onconnected = function(){
    // DEBT null op;
  }
  function transmitReading(reading){
    channel.publish('newReading', reading, function(err){
      if (err) {
        window.console.warn("Unable to send new reading; err = " + err.message);
      }
    })
  }

  this.transmitReading = throttle(transmitReading, newReadingRateLimit);
  this.transmitResetReadings = function(){
    channel.publish("resetReadings", {}, function(err) {
      if(err) {
        window.console.warn("Unable to send reset readings; err = " + err.message);
      }
    });
  },
  this.transmitIdentity = function(){
    console.log('TODO update identity');
  }

  client.connection.on("connected", function(err) {
    uplink.onconnected();
  });
  client.connection.on("failed", function(err) {
    console.log('failed', err.reason.message);
  });
}
