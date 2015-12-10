/* jshint esnext: true */

function Presenter(raw){

  Object.defineProperty(this, "maxFlightTime", {
    get: function(){
      return "0.00 s";
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
