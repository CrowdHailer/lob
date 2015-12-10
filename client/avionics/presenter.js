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
  return round(2)(9.81/8 * t * t);
}

function format(i){
  var padding = "00000";
  var str = i.toFixed(2);
  return padding.substring(0, padding.length - str.length) + str;
}

function Presenter(raw){

  Object.defineProperty(this, "maxFlightTime", {
    get: function(){
      var flights = raw.flightHistory.concat([raw.currentFlight]);
      var flightDurations = flights.map(readingsDuration);
      var time =  Math.max.apply(null, flightDurations);
      return time.toFixed(2) + " s";
    }
  });

  Object.defineProperty(this, "maxAltitude", {
    get: function(){
      return "0.00 m";
    }
  });

  Object.defineProperty(this, "currentReadout", {
    get: function(){
      return "Waiting.";
    }
  });
}

export function present(app){
  return new Presenter(app);
}
export default present;
