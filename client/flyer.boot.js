/* jshint esnext: true */
import "./utils/polyfill";
import Flyer from "./flyer";
import FlyerView from "./flyer/view";
import Router from "./router";


import { throttle } from "./utils/fn";
import { readingPublishLimit } from './config';

var flyer = Flyer();
flyer.logger = window.console;
flyer.view = new FlyerView

var DEVICEMOTION = "devicemotion";
function AccelerometerController(global, flyer){
  global.addEventListener(DEVICEMOTION, function(deviceMotionEvent){
    flyer.newReading(deviceMotionEvent.accelerationIncludingGravity);
  });
}

var accelerometerController = new AccelerometerController(window, flyer);

// import FlyerUplinkController from "./flyer/flyer-uplink-controller";
function FlyerUplinkController(options, flyer){
  var channelName = options.channelName;
  var token = options.token;
  var realtime = new Ably.Realtime({ token: token });
  realtime.connection.on("connected", function(err) {
    // If we keep explicitly passing channel data to the controller we should pass it to the main app here
    flyer.uplinkAvailable({token: token, channelName: channelName});
  });
  window.realtime = realtime;
  realtime.connection.on("failed", function(err) {
    flyer.uplinkFailed();
    console.log(err.reason.message);
  });
  var channel = realtime.channels.get(channelName);
  window.channel = channel;
  function transmitReading(reading){
    channel.publish("newReading", reading, function(err) {
      // DEBT use provided console for messages
      // i.e. have message successful as app actions
      if(err) {
        console.warn("Unable to publish message; err = " + err.message);
      } else {
        console.info("Reding Message successfully sent", reading);
      }
    });
  }

  console.log('readingPublishLimit', readingPublishLimit, 'ms');
  flyer.uplink = {
    transmitReading: throttle(transmitReading, readingPublishLimit),
    transmitResetReadings: function(){
      channel.publish("resetReadings", {}, function(err) {
        // DEBT use provided console for messages
        // i.e. have message successful as app actions
        if(err) {
          window.console.warn("Unable to publish message; err = " + err.message);
        } else {
          // TODO comment to ably that if error here then no information released at all.
          window.console.info("Message successfully sent");
        }
      });
    },
    transmitIdentity: function(){
      console.log('TODO update identity');
    }
  };
}


var router = Router(window.location);
console.log('Router:', 'Started with initial state:', router.state);

var uplinkController = FlyerUplinkController({
  token: router.state.token,
  channelName: router.state.channelName
}, flyer);
export default flyer;
