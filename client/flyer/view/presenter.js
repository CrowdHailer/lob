/* jshint esnext: true */

export function format(i){
  var fixed = i.toFixed(2);
  var signed = i < 0 ? fixed : "+" + fixed;
  var short = "+00.00".length - signed.length;
  var padded = (short == 1) ? signed.replace(/[\+\-]/, function(sign){ return sign + "0"; }) : signed;
  return padded;
}

function Presenter(projection){

  Object.defineProperty(this, "maxFlightTime", {
    get: function(){
      return projection.maxFlightTime + " s";
    }
  });

  Object.defineProperty(this, "maxAltitude", {
    get: function(){
      return projection.maxAltitude + " m";
    }
  });

  Object.defineProperty(this, "currentReadout", {
    get: function(){
      // DEBT replace with reading toString method
      if (!projection.latestReading) {
        return "Waiting.";
      }
      var acceleration = projection.latestReading;
      var x = acceleration.x;
      var y = acceleration.y;
      var z = acceleration.z;
      return "[" + [format(x), format(y), format(z)].join(", ") + "]";
    }
  });

  Object.defineProperty(this, "instruction", {
    get: function(){
      console.log(this)
      if (!this.hasThrow) {
        return "Lob phone to get started";
      }
      return "OK! can you lob any higher";
    }
  });

  Object.defineProperty(this, "hasThrow", {
    get: function(){
      return projection.hasThrow;
    }
  });

  Object.defineProperty(this, "uplinkStatus", {
    get: function(){
      return projection.uplinkStatus.toLowerCase();
    }
  });
  Object.defineProperty(this, "channelName", {
    get: function(){
      return projection.channelName;
    }
  });
  Object.defineProperty(this, "identity", {
    get: function(){
      return projection.identity;
    }
  });
}

export function present(app){
  return new Presenter(app);
}
export default present;
