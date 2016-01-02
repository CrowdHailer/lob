/* jshint esnext: true */

// import * as State from "./state";
import Projection from "./projection";

// DEBT not quite sure why this can't just be named state;
import Struct from "../carbide/struct";

var FLYER_STATE_DEFAULTS = {
  uplinkStatus: "UNKNOWN",
};
function FlyerState(raw){
  if ( !(this instanceof FlyerState) ) { return new FlyerState(raw); }

  Struct.call(this, FLYER_STATE_DEFAULTS, raw);
}

FlyerState.prototype = Object.create(Struct.prototype);
FlyerState.prototype.constructor = FlyerState;

export default function Flyer(state){
  var flyer = this;
  // DEBT could make state always wrap initial value
  if (state === void 0) { state = new FlyerState(); }

  if ( !(state instanceof FlyerState) ) { throw new TypeError("Flyer did not recieve valid initial state"); }
  if ( !(this instanceof Flyer) ) { return new Flyer(state); }

  flyer.state = state;
  // flyer.uplink = {
  //   transmitReading: function(reading){
  //   }
  // };
  // flyer.view = {
  //   render: function(){
  //     console.log("old view");
  //   }
  // };
  //
  // function showcase(state){
  //   flyer.view.render(Projection(state));
  // }
  // function transmitReading(reading){
  //   flyer.uplink.transmitReading(reading);
  // }
  // function logInfo() {
  //   flyer.logger.info.apply(flyer.logger, arguments);
  // }
  //
  // this.resetReadings = function(){
  //   state = FlyerState.resetReadings(state);
  //   logInfo("[Reset readings]");
  //   showcase(flyer.state);
  // };
  // this.newReading = function(reading){
  //   state = FlyerState.newReading(state, reading);
  //   transmitReading(reading);
  //   logInfo("[New reading]", reading);
  //   showcase(flyer.state);
  // };
  // this.uplinkAvailable = function(){
  //   flyer.state.uplinkStatus = "AVAILABLE";
  //   showcase(flyer.state);
  // };
  // this.uplinkFailed = function(){
  //   flyer.state.uplinkStatus = "FAILED";
  //   showcase(flyer.state);
  // };
  // this.startTransmitting = function(){
  //   // try {
  //   //   flyer.state.update("uplinkStatus", Uplink.startTransmitting)
  //   // } catch (e) {
  //   //   view.alert(uplink unavailable)
  //   // }
  //   flyer.state.uplinkStatus = "TRANSMITTING";
  //   showcase(flyer.state);
  // };
  // var logger;
  // Object.defineProperty(flyer, "logger", function(){
  //   get: function(){
  //
  //   }
  // });
}
Flyer.State = FlyerState;
