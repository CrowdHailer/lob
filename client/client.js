/* jshint esnext: true */
import * as Event from "./framework/event";
import * as Logger from "./framework/logger";
import Store from "./store";
import Accelerometer from "./accelerometer";
import Uplink from "./uplink";

function Client(world){
  var logger = world.console;
  var events = {
    resetReadings: Event.start(Logger.wrap(logger, {prefix: "Reset readings"})),
    newReading: Event.start(Logger.wrap(logger, {prefix: "New reading"})),
    badReading: Event.start(Logger.wrap(logger, {prefix: "Bad reading"})),
    uplinkAvailable: Event.start(Logger.wrap(logger, {prefix: "Uplink available"})),
    startTransmitting: Event.start(Logger.wrap(logger, {prefix: "Start transmitting"})),
    uplinkFailed: Event.start(Logger.wrap(logger, {prefix: "Uplink failed"})),
    showAlert: Event.start(Logger.wrap(logger, {prefix: "Show alert"})),
    closeNotices: Event.start(Logger.wrap(logger, {prefix: "Close Notices"}))
  };

  var store = Store.start({});
  events.resetReadings.register(store.resetReadings);
  events.newReading.register(store.newReading);
  events.badReading.register(store.badReading);
  events.uplinkAvailable.register(store.uplinkAvailable);
  events.startTransmitting.register(store.startTransmitting);
  events.uplinkFailed.register(store.uplinkFailed);
  events.showAlert.register(store.showAlert);
  events.closeNotices.register(store.closeNotices);

  this.accelerometer = Accelerometer(this);

  this.uplink = Uplink(this);

  this.resetReadings = function(){
    events.resetReadings();
  };
  this.onResetReadings = function(listener){
    events.resetReadings.register(listener);
  };
  this.newReading = function(reading){
    // Validate here
    events.newReading(reading);
  };
  this.onNewReading = function(listener){
    events.newReading.register(listener);
  };
  this.badReading = function(){
    events.badReading();
  };
  this.onBadReading = function(listener){
    events.badReading.register(listener);
  };
  this.uplinkAvailable = function(){
    events.uplinkAvailable();
  };
  this.onUplinkAvailable = function(listener){
    events.uplinkAvailable.register(listener);
  };
  this.startTransmitting = function(){
    if (store.state.uplink.status == "AVAILABLE") {
      events.startTransmitting();
    } else {
      events.showAlert("Could not start a connection. Please refresh the page to try again.");
    }
  };
  this.onStartTransmitting = function(listener){
    events.startTransmitting.register(listener);
  };
  this.uplinkFailed = events.uplinkFailed;
  this.onUplinkFailed = function(listener){
    events.uplinkFailed.register(listener);
  };
  this.onShowAlert = function(listener){
    events.showAlert.register(listener);
  };
  this.closeNotices = function(){
    events.closeNotices();
  };
  this.onCloseNotices = function(listener){
    events.closeNotices.register(listener);
  };

  Object.defineProperty(this, "currentReading", {
    get: function(){
      var readings = store.state.readings || {};
      return readings.current;
    }
  });

  Object.defineProperty(this, "currentFlight", {
    get: function(){
      var readings = store.state.readings || {};
      return readings.currentFlight || [];
    }
  });
  Object.defineProperty(this, "flightHistory", {
    get: function(){
      var readings = store.state.readings || {};
      return readings.flightHistory || [];
    }
  });
  Object.defineProperty(this, "notices", {
    get: function(){
      return store.state.notices;
    }
  });

  Object.defineProperty(this, "uplinkStatus", {
    get: function(){
      var uplink = store.state.uplink || {status: "UNKNOWN"};
      return uplink.status;
    }
  });
  // DEBT do not start here or enuse that components read first time on starting.
  // events.resetReadings();
}

export function start(world){
  return new Client(world);
}
