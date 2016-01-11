/* jshint esnext: true */
import "./utils/polyfill";
import Flyer from "./flyer/flyer";
import Router from "./router";
import Presenter from "./avionics/presenter";
import Display from "./avionics/display";
import AlertDisplay from "./alert/display";
import { throttle } from "./utils/fn";
import { readingPublishLimit } from './config';


var flyer = new Flyer();
flyer.logger = window.console;
flyer.view = {
  render: function(projection){
    var presentation = Presenter(projection);
    var $avionics = document.querySelector("[data-interface~=avionics]");
    var $alert = document.querySelector("[data-display~=alert]");
    var display = new Display($avionics);
    for (var attribute in display) {
      if (display.hasOwnProperty(attribute)) {
        display[attribute] = presentation[attribute];
      }
    }
    var alertDisplay = AlertDisplay($alert);
    var alertMessage = projection.alert;
    if (alertMessage) {
      alertDisplay.message = alertMessage;
      alertDisplay.active = true;
    } else {
      alertDisplay.active = false;
    }
  }
};

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
  realtime.connection.on("failed", function(err) {
    flyer.uplinkFailed();
    console.log(err.reason.message);
  });
  var channel = realtime.channels.get(channelName);
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
