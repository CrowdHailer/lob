/* jshint esnext: true */

export default function TrackerShowcase(window){
  if ( !(this instanceof TrackerShowcase) ) { return new TrackerShowcase(window); }

  this.update = function(projection){
    console.log('projection', projection);
  };
}
