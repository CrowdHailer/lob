/* jshint esnext: true */

function Display($root){
  var $maxFlightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  var $SubmittedMaxAltitude = $root.querySelector("[data-display~=submitted-max-altitude]");
  var $currentReadout = $root.querySelector("[data-hook~=current-reading]");
  var $instruction = $root.querySelector("[data-display~=instruction]");
  var $uplink = $root.querySelector("[data-display~=uplink]");
  var $channel = $root.querySelector("[data-display~=channel]");
  var $submitFlight = $root.querySelector("[data-display~=submit-flight]");

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
        // DEBT logic in display to be removed
        $SubmittedMaxAltitude.value = maxAltitude.split(' ')[0];
        if (maxAltitude === '0 m') {
          $submitFlight.disabled = true;
        } else {
          $submitFlight.disabled = false;
        }
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
    channelName: {
      set: function(channel){
        var content = "Streaming live Lob '" + channel + "'";
        $channel.innerHTML = content;
      },
      enumerable: true
    },
    uplinkStatus: {
      set: function(status){
        $uplink.classList.remove("unknown");
        $uplink.classList.remove("available");
        $uplink.classList.remove("transmitting");
        $uplink.classList.remove("failed");
        $uplink.classList.add(status);
      },
      enumerable: true
    }
  });

}

export function create($root){ Display($root); }

export default Display;
