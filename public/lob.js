(function () { 'use strict';

  /*jshint esnext: true */

  function throttle(fn, threshhold, scope) {
      threshhold = threshhold || 250;
      var last,
      deferTimer;
      return function () {
        var context = scope || this;
        var now = Date.now(), args = arguments;
        
        if (last && now < last + threshhold) {
          // hold on to it
          clearTimeout(deferTimer);
          deferTimer = setTimeout(function () {
            last = now;
            fn.apply(context, args);
          }, threshhold);
        } else {
          last = now;
          fn.apply(context, args);
        }
      };
    }

  /*jshint esnext: true */

  function querySelector(selector, element) {
    return element.querySelector(selector);
  }

  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function publish(argument) {
    console.log("Publishing");
  }

  var connection = {
    publish: publish
  };

  /*jshint esnext: true */

  function deviceUsesInvertedAcceleration(userAgent) {
    if (userAgent.match(/Windows/i)) {
      return true;
    } else if (userAgent.match(/Android/i)) {
      return false;
    } else {
      return true;
    }
  }

  function lookupAccelerationVectorRectifyForDevice(userAgent, console) {
    var invert = deviceUsesInvertedAcceleration(userAgent);

    if (invert) {
      console.log("Device uses inverted acceleration. UserAgent: \"" + userAgent + "\"");
      return function invertVector(vector) {
        return {
          x: - 1 * vector.x,
          y: - 1 * vector.y,
          z: - 1 * vector.z,
        };
      };
    } else {
      console.log("Device uses standard acceleration. UserAgent: \"" + userAgent + "\"");
      return function identity(vector) { return vector; };
    }
  }

  console.log("Starting Lob script");
  var rectifyAcceleration = lookupAccelerationVectorRectifyForDevice(navigator.userAgent, window.console);

  var deviceMotionHandler = (function (rectifier) {
    return function (deviceMotionEvent) {
      var vector = rectifier(deviceMotionEvent.accelerationIncludingGravity);
      console.log(vector);
    };
  })(rectifyAcceleration);

  deviceMotionHandler = throttle(deviceMotionHandler, 500);

  ready(function () {

    var $flyer = querySelector("#orientation-generator", document);
    console.log($flyer);
    
    if (window.DeviceMotionEvent) {
      $flyer.addEventListener("devicemotion", deviceMotionHandler);
    }
  });


  function stopAccelerationHandler(argument) {
      window.removeEventListener("devicemotion", deviceMotionHandler);
  }

  window.stop = stopAccelerationHandler;

  connection.publish("hello");

})();