var Lob = (function () { 'use strict';

  /* jshint esnext: true */

  function KeyError(key) {
    this.name = "KeyError";
    this.message = "key \"" + key + "\" not found";
    this.stack = (new Error()).stack;
  }
  KeyError.prototype = Object.create(Error.prototype);
  KeyError.prototype.constructor = KeyError;

  function Struct(defaults, source){
    "use strict";
    if ( !(this instanceof Struct) ) { return new Struct(defaults, source); }

    Object.assign(this, defaults);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (!this.hasOwnProperty(key)) {
          throw new KeyError(key);
        }
        this[key] = source[key];
      }
    }
    Object.freeze(this);
  }

  Struct.prototype.hasKey = function (key) {
    return Object.keys(this).indexOf(key) !== -1;
  };

  Struct.prototype.fetch = function (key) {
    if (this.hasKey(key)) {
      return this[key];
    } else {
      throw new KeyError(key);
    }
  };

  Struct.prototype.set = function (key, value) {
    if (this[key] === value) {
      return this;
    }
    var tmp = {};
    tmp[key] = value;
    return this.merge(tmp);
  };

  Struct.prototype.update = function (key, operation) {
    return this.set(key, operation(this[key]));
  };

  Struct.prototype.merge = function (other) {
    return Struct(this, other);
  };

  var STATE_DEFAULTS = {
    uplinkStatus: "UNKNOWN",
    uplinkChannelName: "UNKNOWN",
    flightOutputStatus: "FOLLOWING_FLIGHT", // FOLLOWING_LIVE | HOLDING_SNAPSHOT
    liveFlight: [],
    flightSnapshot: null,
    alert: ""
  };

  function State(raw){
    if ( !(this instanceof State) ) { return new State(raw); }

    return Struct.call(this, STATE_DEFAULTS, raw);
  }

  State.prototype = Object.create(Struct.prototype);
  State.prototype.constructor = State;

  function isInFlight(reading){
    // DEBT magic number
    return reading.magnitude < 4;
  }

  function lastInArray(array){
    return array[array.length - 1];
  }

  function lastNInArray(n, array){
    return array.slice(Math.max(array.length - n, 0));
  }

  var TRACKER_INVALID_STATE_MESSAGE = "Tracker did not recieve valid initial state";

  function Tracker(state, world){
    if ( !(this instanceof Tracker) ) { return new Tracker(state, world); }
    try {
      state = State(state || {});
    } catch (e) {
      // alert(e); DEBT throws in tests
      throw new TypeError(TRACKER_INVALID_STATE_MESSAGE);
      // return; // Will be needed if we move the error handling to logger
    }
    var tracker = this;
    tracker.state = state;
    // DEBT return to external assignment
    world = world || {};
    tracker.logger = world.logger // Or error causing of silent version;

    tracker.uplinkAvailable = function(channelName){
      // Set state action can cause projection to exhibit new state
      tracker.state = tracker.state.set("uplinkStatus", "AVAILABLE");
      tracker.state = tracker.state.set("uplinkChannelName", channelName);
      // call log change. test listeners that the state has changed.
      logInfo("Uplink available on channel:", channelName);
      showcase(tracker.state);
    };

    tracker.uplinkFailed = function(err){
      console.log(err);
      // Set state action can cause projection to exhibit new state
      var state = tracker.state.set("uplinkStatus", "FAILED");
      tracker.state = state.set("alert", "Could not connect to Ably realtime service. Please try again later");
      // tracker.state = tracker.state.set("uplinkChannelName", channelName);
      // // call log change. test listeners that the state has changed.
      logInfo("Uplink failed to connect", err);
      showcase(tracker.state);
    };

    tracker.newReading = function(newReading){
      // DEBT return null reading if array empty
      // DEBT throw error if new reading is missing a magnitude property
      var lastReading = lastInArray(tracker.state.liveFlight)
      var wasInFlight = lastReading && isInFlight(lastReading);
      var isNowGrounded = !isInFlight(newReading);
      if (wasInFlight && isNowGrounded) {
        setTimeout(function () {
          console.log('pause the reading');
          // pause the newReading
        }, 1000);
      }

      var state = tracker.state.update("liveFlight", function(readings){
        readings = readings.concat(newReading);
        // DEBT make configurable
        return lastNInArray(40, readings);
      });
      // simplest is to just start timer
      // here to add timer controller
      tracker.state = state; // Assign at end to work as transaction
      showcase(state);
      // logEvent("New newReading");
    };

    tracker.holdSnapshot = function(){
      // Take and hold a snapshot only if the tracker is tracking flights
      if (tracker.state.flightOutputStatus !== 'FOLLOWING_FLIGHT') {
        return;
      }
      // Only if current flight has content
      var state = tracker.state.set('flightSnapshot', tracker.state.liveFlight);
      state = state.set('flightOutputStatus', 'HOLDING_SNAPSHOT');

      tracker.state = state; // Assign at end to work as transaction
      showcase(state);
      logEvent("Taken snapshot");
    };

    tracker.followFlight = function(){
      var state = tracker.state.set('flightOutputStatus', 'FOLLOWING_FLIGHT');
      state.set('flightSnapshot', null); // probably unnecessary as we can use the flight output status
      tracker.state = state;
      showcase(state);
      logEvent("following flight");
    };
    // This state is for when we are following a live feed but do not want pause at flight end
    tracker.followLive = function(){
      var state = tracker.state.set('flightOutputStatus', 'FOLLOWING_LIVE');
      tracker.state = state;
      showcase(state);
      logEvent("following live readings");
    };

    tracker.closeAlert = function(){
      // DEBT untested
      tracker.state = tracker.state.set("alert", "");
      showcase(tracker.state);
      logEvent("Alert closed");
    };

    function logEvent() {
      tracker.logger.debug.apply(tracker.logger, arguments);
    }
    function logInfo() {
      tracker.logger.info.apply(tracker.logger, arguments);
    }
    function showcase(state) {
      tracker.showcase.update(state);
    }

    function projectState(state){
      return state;
    }

    // The tracker application has an internal state.
    // All observers know that the can watch a given projection of that state
    // project and present overloaded verbs.
    // options showcase or exhibit
    // function showcase(state){
    //   // The tracker just cares that its state is shown somewhere
    //   tracker.showcase.dispatch(state);
    // }



    tracker.resetReadings = function(){
    };
  }

  /* jshint esnext: true */
  function isRational(x, other) {
    if (typeof x !== "number"){
      return false;
    }
    if (!isFinite(x)){
      return false;
    }
    var rest = Array.prototype.slice.call(arguments, 1);
    if (rest.length > 0) {
      return isRational.apply(this, rest);
    }
    return true;
  }

  function roundtoFour(number) {
    return parseFloat(number.toFixed(4));
  }

  function Reading(raw){
    if ( !(this instanceof Reading) ) { return new Reading(raw); }

    this.x = raw.x;
    this.y = raw.y;
    this.z = raw.z;
    this.timestamp = raw.timestamp;

    if (!isRational(this.x, this.y, this.z, this.timestamp)) {
      throw new TypeError("Reading should have numerical values for x, y, z & timestamp");
    }
  }

  Object.defineProperty(Reading.prototype, "magnitude", {
    get: function(){
      return roundtoFour(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
    }
  });

  /* jshint esnext: true */

  // Router makes use of current location
  // Router should always return some value of state it does not have the knowledge to regard it as invalid
  // Router is currently untested
  // Router does not follow modifications to the application location.
  // Router is generic for tracker and flyer at the moment
  // location is a size cause and might make sense to be lazily applied
  function Router(location){
    if ( !(this instanceof Router) ) { return new Router(location); }
    var router = this;
    router.location = location;

    function getState(){
      return {
        token: getQueryParameter('token', router.location.search),
        channelName: getQueryParameter('channel-name', router.location.search)
      };
    }

    Object.defineProperty(router, 'state', {
      get: getState
    });
  }

  function getQueryParameter(name, queryString) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(queryString);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  function TrackerShowcase(window){
    if ( !(this instanceof TrackerShowcase) ) { return new TrackerShowcase(window); }
    var showcase = this;
    var views = [];


    this.update = function(projection){
      // Values needed in display
      // isLive
      // readings
      // isLockedToLiveReadings
      // graph lines
      // uplink statuses
      showcase.projection = this;
      views.forEach(function(view){
        view.render(projection);
      });
    };

    this.addView = function(view){
      if (showcase.projection) {
        view.render(showcase.projection);
      }
      views.push(view);
    };
  }

  /* jshint esnext: true */
  function UplinkController(options, tracker){
    var channelName = options.channelName;
    var token = options.token;
    var realtime = new Ably.Realtime({ token: token });
    realtime.connection.on("connected", function(err) {
      // If we keep explicitly passing channel data to the controller we should pass it to the main app here
      tracker.uplinkAvailable(channelName);
    });
    realtime.connection.on("failed", function(err) {
      tracker.uplinkFailed(err);
    });
    var channel = realtime.channels.get(channelName);
    channel.subscribe("newReading", function(event){
      // new Vector(event.data);
      tracker.newReading(Reading(event.data));
    });
    channel.subscribe("resetReadings", function(_event){
      tracker.resetReadings();
    });
  }

  // uplink controller does very little work so it is not separated from uplink

  // function Uplink(options, logger){
  //   var channelName = options.channel;
  //   var token = options.token;
  //   var realtime = new Ably.Realtime({ token: token });
  //   var channel = realtime.channels.get(channelName);
  //   realtime.connection.on("connected", function(err) {
  //     console.log("realtime connected");
  //   });
  //   realtime.connection.on("failed", function(err) {
  //     console.log("realtime connection failed");
  //   });
  // }

  /* jshint esnext: true */

  function ready(fn) {
    if (document.readyState !== "loading"){
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  if (!Object.assign) {
    Object.defineProperty(Object, 'assign', {
      enumerable: false,
      configurable: true,
      writable: true,
      value: function(target) {
        'use strict';
        if (target === undefined || target === null) {
          throw new TypeError('Cannot convert first argument to object');
        }

        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
          var nextSource = arguments[i];
          if (nextSource === undefined || nextSource === null) {
            continue;
          }
          nextSource = Object(nextSource);

          var keysArray = Object.keys(nextSource);
          for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
            var nextKey = keysArray[nextIndex];
            var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
            if (desc !== undefined && desc.enumerable) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
        return to;
      }
    });
  }

  /* jshint esnext: true */

  function Display($root){
    var $message = $root.querySelector("[data-display~=message]");
    return Object.create({}, {
      active: {
        set: function(active){
          var ACTIVE = "active";
          if (active) {
            $root.classList.add(ACTIVE);
          } else {
            $root.classList.remove(ACTIVE);
          }
        },
        enumerable: true
      },
      message: {
        set: function(message){
          console.log(message);
          $message.innerHTML = message;
        }
      }
    });
  }

  // GENERAL CONFIGURATION
  window.Tracker = Tracker;
  window.Tracker.Reading = Reading;

  var router = Router(window.location);
  console.log('Router:', 'Started with initial state:', router.state);


  var tracker = new Tracker();
  tracker.logger = window.console;
  tracker.showcase = TrackerShowcase(window);

  var uplinkController = new UplinkController(router.state, tracker);

  function uplinkStatusMessageFromProjection(projection) {
    var message = projection.uplinkStatus;
    if (message === 'AVAILABLE') {
      return 'Connection made to channel "' + projection.uplinkChannelName +'"';
    } else if (message === 'FAILED') {
      return 'Could not connect to Ably service';
    } else {
      return 'Unknown';
    }
  }

  function GraphDisplay($root){
    if ( !(this instanceof GraphDisplay) ) { return new GraphDisplay($root); }
    var canvas = $root.querySelector('canvas');
    var canvasContext = canvas.getContext("2d");
    console.log(canvas)
    // DEBT data can come from $root dataset
    var data = {
      labels: [],
      datasets: [{
        label: "X",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "limegreen",
        pointColor: "limegreen",
        data: []
      }, {
        label: "Y",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "green",
        pointColor: "green",
        data: []
      }, {
        label: "Z",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "teal",
        pointColor: "teal",
        data: []
      }, {
        label: "Magnitude",
        fillColor: "rgba(220,220,220,0)",
        strokeColor: "orange",
        pointColor: "orange",
        data: []
      }]
    };
    var i = 0.0;
    // add point
    // clear
    var myLineChart = new Chart(canvasContext).Line(data, {animation: false, animationSteps: 4, pointDot : false});
    window.myLineChart = myLineChart
    this.addPoint = function(point){
      var date = new Date(point.timestamp)
      myLineChart.addData([point.x, point.y, point.z, point.magnitude], date.getMinutes() + ':' + date.getSeconds() + 's');
      // DEBT make length part of config
      if (myLineChart.datasets[0].points.length > 20) {
        myLineChart.removeData();
      }
      i = i + 0.25;
    }
    this.clear = function(){
      myLineChart.destroy();
      // i = 0.0;
      data.labels = [];
      myLineChart = new Chart(canvasContext).Line(data, {animation: false, animationSteps: 4, pointDot : false});
    }
    this.setPoints = function(points){
      // DEBT remove use of this
      var self = this;
      this.clear();
      points.forEach(function(point){
        self.addPoint(point);
      })
    }
  }
  ready(function(){
    var $root = document.documentElement;
    var $uplinkStatusMessage = queryDisplay('uplink-status-message', $root);
    var $trackerHoldingSnapshot = queryDisplay('tracker-holding-snapshot', $root);
    var $trackerFollowingLive = queryDisplay('tracker-following-live', $root);
    var $trackerFollowingFlight = queryDisplay('tracker-following-flight', $root);
    var $alert = queryDisplay('alert', $root);
    var alertDisplay = Display($alert);

    var $graphDisplay = queryDisplay('tracker-graph', $root);
    var graphDisplay = GraphDisplay($graphDisplay);
    window.graphDisplay = graphDisplay;
    console.debug('dom is ready', $uplinkStatusMessage);

    var mainView = {
      render: function(projection){
        // console.debug('Display rendering:', projection);
        $uplinkStatusMessage.innerHTML = uplinkStatusMessageFromProjection(projection);
        if (projection.flightOutputStatus === 'HOLDING_SNAPSHOT') {
          $trackerHoldingSnapshot.style.display = '';
          $trackerFollowingLive.style.display = 'none';
          $trackerFollowingFlight.style.display = 'none';

        } else if (projection.flightOutputStatus === 'FOLLOWING_LIVE') {
          $trackerHoldingSnapshot.style.display = 'none';
          $trackerFollowingLive.style.display = '';
          $trackerFollowingFlight.style.display = 'none';

        } else if (projection.flightOutputStatus === 'FOLLOWING_FLIGHT') {
          $trackerHoldingSnapshot.style.display = 'none';
          $trackerFollowingLive.style.display = 'none';
          $trackerFollowingFlight.style.display = '';
        }
        var alertMessage = projection.alert;
        if (alertMessage) {
          alertDisplay.message = alertMessage;
          alertDisplay.active = true;
        } else {
          alertDisplay.active = false;
        }
        graphDisplay.setPoints(projection.flightSnapshot || projection.liveFlight);
      }
    };
    tracker.showcase.addView(mainView);
  });


  // Dom views should be initialized with the ready on certain selectors library
  function queryDisplay(display, element){
    return element.querySelector('[data-display~=' + display + ']');
  }

  return tracker;

})();
//# sourceMappingURL=tracker.js.map