/* jshint esnext: true */

function Display($root){
  var $flightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  var $currentReading = $root.querySelector("[data-hook~=current-reading]");
  var $nextAction = $root.querySelector("[data-display~=instruction]");

  return Object.create({}, {
    maxFlightTime: {
      set: function(maxFlightTime){
        $flightTime.innerHTML = maxFlightTime;
      },
      enumerable: true
    }
  });

  // function render(presentation){
  //   $flightTime.innerHTML = presentation.maxFlightTime + "s";
  //   $maxAltitude.innerHTML = presentation.maxAltitude + "m";
  //   $currentReading.innerHTML = presentation.currentReading;
  //   if (presentation.maxAltitude == 0){
  //     $nextAction.innerHTML = "Lob phone to get started";
  //   } else {
  //     $nextAction.innerHTML = "OK! can you lob any higher";
  //   }
  // };
  // return {
  //   update: function(store){
  //     var state = store.getState();
  //     var presenter = AvionicsPresenter.create(state);
  //     render(presenter);
  //   }
  // };
}

export function create($root){ Display($root); }

export default Display
