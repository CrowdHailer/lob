/* jshint esnext: true */

function readingsDuration(readings){
  if (!readings[0]) { return 0; }

  var t0 = readings[0].timestamp;
  var t1 = readings[readings.length - 1].timestamp;

  return (t1 - t0) / 1000;
}

function altitudeForFreefallDuration(duration){
  // Altitude Calculation

  // SUVAT
  // s = vt - 0.5 * a * t^2
  // input
  // s = s <- desired result
  // u = ? <- not needed
  // v = 0 <- stationary at top
  // a = - 9.81 <- local g
  // t = flightTime/2 time to top of arc

  // s = 9.81 * 1/8 t^2
  var t = duration;
  return 9.81/8 * t * t;
}

function round(number){
  return parseFloat(number.toFixed(2));
}

function maxFlightDuration(flights) {
  var flightDurations = flights.map(readingsDuration);
  return Math.max.apply(null, flightDurations);
}

function maxAltitude(flights) {
  var flightDurations = flights.map(readingsDuration);
  var max = Math.max.apply(null, [0].concat(flightDurations));
  return round(altitudeForFreefallDuration(max));
}

function Projection(rawState){
  Object.defineProperty(this, "maxFlightTime", {
    get: function(){
      return maxFlightDuration(rawState.flightHistory.concat(rawState.currentFlight));
    }
  });

  Object.defineProperty(this, "lastFlightTime", {
    get: function(){
      var lastFlight = rawState.flightHistory[rawState.flightHistory.length - 1];
      return maxFlightDuration([lastFlight]);
    }
  });

  Object.defineProperty(this, "lastFlightTimestamp", {
    get: function(){
      var lastFlight = rawState.flightHistory[rawState.flightHistory.length - 1];
      return lastFlight[lastFlight.length-1].timestamp;
    }
  });

  Object.defineProperty(this, "flightCount", {
    get: function(){
      return rawState.flightHistory.length;
    }
  });

  Object.defineProperty(this, "maxAltitude", {
    get: function(){
      return maxAltitude(rawState.flightHistory.concat(rawState.currentFlight));
    }
  });

  Object.defineProperty(this, "lastAltitude", {
    get: function(){
      var lastFlight = rawState.flightHistory[rawState.flightHistory.length - 1];
      return maxAltitude([lastFlight]);
    }
  });

  Object.defineProperty(this, "latestReading", {
    get: function(){
      return rawState.latestReading;
    }
  });

  Object.defineProperty(this, "hasThrow", {
    get: function(){
      return this.maxAltitude !== 0;
    }
  });

  Object.defineProperty(this, "hasOneThrow", {
    get: function(){
      return this.hasThrow && (rawState.flightHistory.length === 1);
    }
  });

  Object.defineProperty(this, "uplinkStatus", {
    get: function(){
      return rawState.uplinkStatus;
    }
  });
  Object.defineProperty(this, "channelName", {
    get: function(){
      return rawState.uplinkDetails.channelName;
    }
  });
  Object.defineProperty(this, "alert", {
    get: function(){
      return rawState.alert;
    }
  });
}

export function project(app){
  return new Projection(app);
}
export default project;
