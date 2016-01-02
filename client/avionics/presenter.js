/* jshint esnext: true */

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
      return raw.maxFlightTime + " s";
    }
  });

  Object.defineProperty(this, "maxAltitude", {
    get: function(){
      return raw.maxAltitude + " m";
    }
  });

  Object.defineProperty(this, "currentReadout", {
    get: function(){
      // DEBT replace with reading toString method
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
      if (!this.hasThrow) {
        return "Lob phone to get started";
      }
      return "OK! can you lob any higher";
    }
  });

  Object.defineProperty(this, "uplinkStatus", {
    get: function(){
      return raw.uplinkStatus.toLowerCase();
    }
  });
  Object.defineProperty(this, "channelName", {
    get: function(){
      return raw.channelName;
    }
  });
}

export function present(app){
  return new Presenter(app);
}
export default present;
