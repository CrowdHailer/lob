/* jshint esnext: true */
import "./utils/polyfill";
import Flyer from "./flyer";
import Router from "./router";
import FlyerView from "./flyer/view";
import FlyerUplink from './flyer/uplink';

import { readingPublishLimit } from './config';

var router = Router(window.location);

var uplink = FlyerUplink({
  channelName: router.state.channelName,
  rateLimit: readingPublishLimit
}, window.console);

var flyer = Flyer();


flyer.logger = window.console;
flyer.view = new FlyerView
flyer.uplink = uplink;

function AccelerometerController(global, flyer){
  global.addEventListener('devicemotion', function(deviceMotionEvent){
    flyer.newReading(deviceMotionEvent.accelerationIncludingGravity);
  });
  global.addEventListener('deviceorientation', function(deviceOrientationEvent){
    flyer.newOrientation({ alpha: deviceOrientationEvent.alpha, beta: deviceOrientationEvent.beta, gamma: deviceOrientationEvent.gamma });
  });
}

var accelerometerController = new AccelerometerController(window, flyer);

function UplinkController(uplink, application){
  uplink.onconnected = function(){
    application.uplinkAvailable({ channelName: uplink.channelName });
  }
  uplink.onconnectionFailed = function(){
    application.uplinkFailed();
  }
  uplink.onconnectionDisconnected = function(){
    application.uplinkDisconnected({ channelName: uplink.channelName });
  }
}
var uplinkController = new UplinkController(uplink, flyer);
export default flyer;
