/* jshint esnext: true */

function readingsDuration(readings){
  if (!readings[0]) { return 0; }
  var last = readings.length;
  var t0 = readings[0].timestamp;
  var t1 = readings[last - 1].timestamp;
  // DEBT Magic number that make sense when sample rate is every 250ms
  return (t1 + 250 - t0) / 1000;
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

function Projection(raw){

  Object.defineProperty(this, "maxFlightTime", {
    get: function(){
      var flights = raw.flightHistory.concat([raw.currentFlight]);
      var flightDurations = flights.map(readingsDuration);
      var time =  Math.max.apply(null, flightDurations);
      return time;
    }
  });

  Object.defineProperty(this, "maxAltitude", {
    get: function(){
      var flightDurations = raw.flightHistory.map(readingsDuration);
      var max = Math.max.apply(null, [0].concat(flightDurations));
      return round(altitudeForFreefallDuration(max));
    }
  });

  Object.defineProperty(this, "currentReading", {
    get: function(){
      return raw.currentReading;
    }
  });

  Object.defineProperty(this, "hasThrow", {
    get: function(){
      return this.maxAltitude !== 0;
    }
  });

  Object.defineProperty(this, "uplinkStatus", {
    get: function(){
      return raw.uplinkStatus;
    }
  });
  Object.defineProperty(this, "channelName", {
    get: function(){
      return raw.uplinkDetails.channelName;
    }
  });
  Object.defineProperty(this, "alert", {
    get: function(){
      return raw.alert;
    }
  });
}

export function project(app){
  return new Projection(app);
}
export default project;
