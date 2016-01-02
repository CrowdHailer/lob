/* jshint esnext: true */
import Flyer from "./flyer/flyer";
import Presenter from "./avionics/presenter";
import Display from "./avionics/display";

var flyer = new Flyer();
flyer.logger = window.console;
flyer.view = {
  render: function(projection){
    var presentation = Presenter(projection);
    var $avionics = document.querySelector("[data-interface~=avionics]");
    var display = new Display($avionics);
    for (var attribute in display) {
      if (display.hasOwnProperty(attribute)) {
        display[attribute] = presentation[attribute];
      }
    }
  }
};

var DEVICEMOTION = "devicemotion";
function AccelerometerController(global, flyer){
  global.addEventListener(DEVICEMOTION, function(deviceMotionEvent){
    console.debug("AccelerometerController", deviceMotionEvent);
    flyer.newReading(deviceMotionEvent.accelerationIncludingGravity);
  });
}

var accelerometerController = new AccelerometerController(window, flyer);

// import FlyerUplinkController from "./flyer/flyer-uplink-controller";
export default function FlyerUplinkController(options, tracker){
  var channelName = options.channel;
  var token = options.token;
  var realtime = new Ably.Realtime({ token: token });
  realtime.connection.on("connected", function(err) {
    // If we keep explicitly passing channel data to the controller we should pass it to the main app here
    flyer.uplinkAvailable({token: token, channelName: channelName});
  });
  realtime.connection.on("failed", function(err) {
    flyer.uplinkFailed();
  });
  var channel = realtime.channels.get(channelName);
  tracker.uplink = {
    transmitReading: function(reading){
      channel.publish("newReading", reading, function(err) {
        // DEBT use provided console for messages
        // i.e. have message successful as app actions
        if(err) {
          console.warn("Unable to publish message; err = " + err.message);
        } else {
          console.info("Message successfully sent", reading);
        }
      });
    }
  };
}

import * as URI from "./uri";
var uri = URI.parseLocation(window.location);

var uplinkController = FlyerUplinkController({
  token: uri.query.token,
  channel: uri.query.channel
}, flyer);
export default flyer;
