/* jshint esnext: true */
export default function Flyer(world){
  if ( !(this instanceof Flyer) ) { return new Flyer(world); }

  this.newReading = function(reading){
    console.log("new reading", reading);
  };
  this.resetReadings = function(){

  };
}
