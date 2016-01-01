/* jshint esnext: true */
// TODO handle polyfill
import "../polyfill";

function lens(key){
  return function(func){
    return function(obj){
      obj = obj || key;
      var update = {};
      update[key] = func(obj[key]);
      return Object.assign({}, obj, update);
    };
  };
}

var compose = function () {
  var fns = arguments;

  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
};

var FREEFALL_LIMIT = 4;

var Reading = {
  freefall: function(reading){
    var a = reading.acceleration;
    var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    return magnitude < FREEFALL_LIMIT;
  }
};

var EMPTY_READINGS = Object.freeze({
  currentFlight: [],
  current: null,
  flightHistory: []
});

var readings = {
  reset: function(_readings){
    return EMPTY_READINGS;
  },
  // new: function(readings, reading){
  //   return Object.assign({}, readings, {current: reading});
  // }
};

export var resetReadings = lens("readings")(readings.reset);

export function newReading(state, current){
  state = state || {};
  var readings = state.readings || EMPTY_READINGS;
  var currentFlight = readings.currentFlight;
  var flightHistory = readings.flightHistory;
  if (Reading.freefall(current)) {
    currentFlight = currentFlight.concat(current);
  } else if(currentFlight[0]) {
    flightHistory = flightHistory.concat([currentFlight]);
    currentFlight = [];
  }
  readings = {current: current, currentFlight: currentFlight, flightHistory: flightHistory};
  return Object.assign({}, state, {readings: readings});
}

export function badReading(state){
  var MESSAGE = "Could not read the data from this device. Please try again on a mobile with working accelerometer.";
  return showAlert(state, MESSAGE);
}
export function showAlert(state, message){
  state = state || {};
  var notices = state.notices || [];
  notices = notices.concat(message);
  return Object.assign({}, state, {notices: notices});
}

export function closeNotices(state){
  state = state || {};
  var notices = [];
  return Object.assign({}, state, {notices: notices});
}

export function uplinkAvailable(state){
  state = state || {};
  var uplink = state.uplink || {};
  return Object.assign({}, state, {uplink: {status: "AVAILABLE"}});
}
export function startTransmitting(state){
  state = state || {};
  var uplink = state.uplink || {};
  return Object.assign({}, state, {uplink: {status: "TRANSMITTING"}});
}
export function uplinkFailed(state){
  state = state || {};
  var uplink = state.uplink || {};
  return Object.assign({}, state, {uplink: {status: "FAILED"}});
}
