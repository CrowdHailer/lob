(function () { 'use strict';

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
      return function normalizeVector(vector) {
        return {
          x: 1 * vector.x,
          y: 1 * vector.y,
          z: 1 * vector.z,
        };
      };
    }
  }

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

  function querySelectorAll(selector, element) {
    return Array.prototype.slice.call(element.querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState != 'loading'){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /*jshint esnext: true */

  var apiKey = "1YRBpA.Kva1OA:Wy71uGGrQ8kFl8L_";
  var channelName = "test";
  var realtime = new Ably.Realtime({ key: apiKey });
  var channel = realtime.channels.get(channelName);

  function publish(eventName, vector){
    channel.publish(eventName, vector, function(err) {
      if(err)
      console.log('Unable to publish message; err = ' + err.message);
      else
      console.log('Message successfully sent');
    });
  }

  function subscribe(eventName, callback) {
    console.log("subscribe");
    channel.subscribe(eventName, callback);
  }

  var connection = {
    publish: publish,
    subscribe: subscribe
  };

  function Flyer($root) {
    console.log("Starting feature: \"Flyer\"");

    var $startButton = querySelector("#start", $root);
    $startButton.addEventListener("click", function (event) {
      var startEvent = new CustomEvent('startReporting', {bubbles: true});
      $root.dispatchEvent(startEvent);
    });
    var $stopButton = querySelector("#stop", $root);
    $stopButton.addEventListener("click", function (event) {
      var stopEvent = new CustomEvent('stopReporting', {bubbles: true});
      $root.dispatchEvent(stopEvent);
    });
    var $refreshButton = querySelector("#refresh", $root);
    $refreshButton.addEventListener("click", function (event) {
      var refreshEvent = new CustomEvent('refreshReporting', {bubbles: true});
      $root.dispatchEvent(refreshEvent);
    });
  }

  function Flyer$1($root) {
    console.log("Starting feature: \"Tracker\"");

    var ctx = $root.querySelector("#myChart").getContext("2d");
    var myNewChart = new Chart(ctx);
    var data = {
      labels: [],
      datasets: [{
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "limegreen",
        pointColor: "limegreen",
        data: []
      }, {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "green",
        pointColor: "green",
        data: []
      }, {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "teal",
        pointColor: "teal",
        data: []
      }, {
        label: "My First dataset",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "orange",
        pointColor: "orange",
        data: []
      }]
    };
    var myLineChart = new Chart(ctx).Line(data, {animation: false, animationSteps: 4, pointDot : false});

    var i = 0.0;

    return {
      accelerationEvent: function (message) {
        var x = message.data.x;
        var y = message.data.y;
        var z = message.data.z;
        console.log(message.data.t);
        var m = Math.sqrt(x*x + y*y + z*z);
        myLineChart.addData([x, y, z, m], i);
        i = i + 0.25;
      },
      refreshEvent: function () {
        myLineChart.destroy();
        i = 0.0;
        data.labels = [];
        // labels array is mutated by adding data.
        myLineChart = new Chart(ctx).Line(data, {animation: false, animationSteps: 4, pointDot : false});
      }
    };
  }

  // Set up Acceleration External Service
  var rectifyAcceleration = lookupAccelerationVectorRectifyForDevice(navigator.userAgent, window.console);

  var deviceMotionHandler = (function (rectifier) {
    return function (deviceMotionEvent) {
      var vector = rectifier(deviceMotionEvent.accelerationIncludingGravity);
      // DEBT must be a simple JS object error if passed a deviceAcceleration object
      connection.publish("accelerationEvent", vector);
    };
  })(rectifyAcceleration);

  deviceMotionHandler = throttle(deviceMotionHandler, 500);


  function FlyerStartButton($element) {
    $element.addEventListener("click", function (event) {
      var startEvent = new CustomEvent('startReporting', {bubbles: true});
      $element.dispatchEvent(startEvent);
    });
  }

  function FlyerPage1($element) {
    document.addEventListener("startReporting", function (event) {
      $element.classList.add("finished");
    });
  }

  ready(function () {

    var $flyer = querySelector("#flyer", document);
    var $tracker = querySelector("#orientation-tracker", document);

    if ($flyer) {
      var flyer = Flyer($flyer);

      document.addEventListener("startReporting", function (event) {
        if (window.DeviceMotionEvent) {
          window.addEventListener("devicemotion", deviceMotionHandler);
        }
      });
      document.addEventListener("stopReporting", function (event) {
        window.removeEventListener("devicemotion", deviceMotionHandler);
      });
      document.addEventListener("refreshReporting", function (event) {
        connection.publish("refreshEvent", {});
      });
    }

    if ($tracker) {
      var tracker = Flyer$1($tracker);

      connection.subscribe("accelerationEvent", function (evt) {
        tracker.accelerationEvent(evt);
      });
      connection.subscribe("refreshEvent", function (evt) {
        tracker.refreshEvent(evt);
      });
    }

    var $flyerStartButtons = querySelectorAll("[data-feature~=flyer-start-button]", document);
    $flyerStartButtons.forEach(function ($button) {
      FlyerStartButton($button);
    });

    var $flyerPage1 = querySelectorAll("[data-feature~=flyer-page-1]", document);
    $flyerPage1.forEach(function ($page) {
      FlyerPage1($page);
    });
  });

})();