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

export function format(i){
  var fixed = i.toFixed(2);
  var signed = i < 0 ? fixed : "+" + fixed;
  var short = "+00.00".length - signed.length;
  var padded = (short == 1) ? signed.replace(/[\+\-]/, function(sign){ return sign + "0"; }) : signed;
  return padded;
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
      var flightDurations = raw.flightHistory.map(readingsDuration);
      var max = Math.max.apply(null, [0].concat(flightDurations));
      return altitudeForFreefallDuration(max).toFixed(2) + " m";
    }
  });

  Object.defineProperty(this, "currentReadout", {
    get: function(){
      if (!raw.currentReading) {
        return "Waiting.";
      }
      var acceleration = raw.currentReading.acceleration;
      var x = acceleration.x;
      var y = acceleration.y;
      var z = acceleration.z;
      return "[" + [format(x), format(y), format(z)].join(", ") + "]";
    }
  });

  Object.defineProperty(this, "instruction", {
    get: function(){
      if (this.maxAltitude == "0.00 m") {
        return "Lob phone to get started";
      }
      return "OK! can you lob any higher";
    }
  });
}

export function present(app){
  return new Presenter(app);
}
export default present;
