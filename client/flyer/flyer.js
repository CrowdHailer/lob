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

  // DEBT with return statement is not an instance of FlyerState.
  // without return statement does not work at all.
  return Struct.call(this, FLYER_STATE_DEFAULTS, raw);
}

FlyerState.prototype = Object.create(Struct.prototype);
FlyerState.prototype.constructor = FlyerState;

var INVALID_STATE_MESSAGE = "Flyer did not recieve valid initial state";

export default function Flyer(state){
  if ( !(this instanceof Flyer) ) { return new Flyer(state); }
  try {
    state = FlyerState(state || {});
  } catch (e) {
    throw new TypeError(INVALID_STATE_MESSAGE);
  }

  var flyer = this;
  flyer.state = state;

  flyer.uplinkAvailable = function(){
    // Set state action can cause projection to exhibit new state
    flyer.state = flyer.state.set("uplinkStatus", "AVAILABLE");
    // call log change. test listeners that the state has changed.
    // stateChange({state: state, action: "Uplink Available", log: debug});
    logInfo("[Uplink Available]");
    showcase(flyer.state);
  };
  flyer.newReading = function(reading){
    // state = FlyerState.newReading(state, reading);
    transmitReading(reading);
    // logInfo("[New reading]", reading);
    // showcase(flyer.state);
  };

  // DEBT what to do before other values are set
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
  function transmitReading(reading){
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      flyer.uplink.transmitReading(reading);
    }
  }
  function showcase(state){
    flyer.view.render(Projection(state));
  }
  function logInfo() {
    flyer.logger.info.apply(flyer.logger, arguments);
  }
  //
  // this.resetReadings = function(){
  //   state = FlyerState.resetReadings(state);
  //   logInfo("[Reset readings]");
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
