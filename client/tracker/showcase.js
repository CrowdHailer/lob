/* jshint esnext: true */

function isLive(projection){
  return !projection.flightSnapshot;
}

export default function TrackerShowcase(window){
  if ( !(this instanceof TrackerShowcase) ) { return new TrackerShowcase(window); }
  var showcase = this;
  var views = [];


  this.update = function(projection){
    // Values needed in display
    // isLive
    // readings
    // isLockedToLiveReadings
    // graph lines
    // uplink statuses
    console.log('projection', projection);
    console.log('display', {
      isLive: isLive(projection),
      readings: projection.flightSnapshot || projection.liveFlight
    });
    showcase.projection = this;
    views.forEach(function(view){
      view.render(projection);
    });
  };

  this.addView = function(view){
    if (showcase.projection) {
      view.render(showcase.projection);
    }
    views.push(view);
  };
}
