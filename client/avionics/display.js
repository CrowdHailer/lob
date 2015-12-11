/* jshint esnext: true */

function Display($root){
  var $maxFlightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  var $currentReadout = $root.querySelector("[data-hook~=current-reading]");
  var $instruction = $root.querySelector("[data-display~=instruction]");

  return Object.create({}, {
    maxFlightTime: {
      set: function(maxFlightTime){
        $maxFlightTime.innerHTML = maxFlightTime;
      },
      enumerable: true
    },
    maxAltitude: {
      set: function(maxAltitude){
        $maxAltitude.innerHTML = maxAltitude;
      },
      enumerable: true
    },
    currentReadout: {
      set: function(currentReadout){
        $currentReadout.innerHTML = currentReadout;
      },
      enumerable: true
    },
    instruction: {
      set: function(instruction){
        $instruction.innerHTML = instruction;
      },
      enumerable: true
    },
  });

}

export function create($root){ Display($root); }

export default Display;
