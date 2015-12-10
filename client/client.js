/* jshint esnext: true */

function Client(){

  this.resetReadings = function(){

  };

  Object.defineProperty(this, "currentReading", {
    get: function(){
      return null;
    }
  });

  Object.defineProperty(this, "currentFlight", {
    get: function(){
      return [];
    }
  });
  Object.defineProperty(this, "flightHistory", {
    get: function(){
      return [];
    }
  });
}

export function start(){
  return new Client();
}
