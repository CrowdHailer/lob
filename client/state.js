/* jshint esnext: true */
import "./polyfill";

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


var EMPTY_READINGS = Object.freeze({
  currentFlight: [],
  current: null,
  flightHistory: []
});

var readings = {
  reset: function(_state){
    return EMPTY_READINGS;
  }
};

export var resetReadings = lens("readings")(readings.reset);
