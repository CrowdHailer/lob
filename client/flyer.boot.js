/* jshint esnext: true */
import "./utils/polyfill";
import Flyer from "./flyer";
import Router from "./router";
import FlyerView from "./flyer/view";
import FlyerUplink from './flyer/uplink';

import { readingPublishLimit } from './config';

var lobIdentity = localStorage.getItem('lobIdentity');
if (!lobIdentity) {
  var parser = new UAParser();
  var result = parser.getResult();
  lobIdentity = result.device.model || result.browser.name;
  try {
    localStorage.setItem('lobIdentity', lobIdentity);
  } catch (err) {
    console.warn('set local storage failed');
  }
}

var router = Router(window.location);

var uplink = FlyerUplink({
  token: router.state.token,
  channelName: router.state.channelName,
  rateLimit: readingPublishLimit
}, window.console);

var flyer = Flyer({
  identity: lobIdentity
});


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
    application.uplinkAvailable({token: uplink.token, channelName: uplink.channelName});
  }
  uplink.onconnectionFailed = function(){
    application.uplinkFailed();
  }
}
var uplinkController = new UplinkController(uplink, flyer);
export default flyer;
