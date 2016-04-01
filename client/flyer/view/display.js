/* jshint esnext: true */

function Display($root){
  var $maxFlightTime = $root.querySelector("[data-hook~=flight-time]");
  var $maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
  var $submittedMaxAltitude = $root.querySelector("[data-display~=submitted-max-altitude]");
  var $instruction = $root.querySelector("[data-display~=instruction]");
  var $uplinkStatus = $root.querySelector("[data-display~=uplink-status]");
  var $submitFlight = $root.querySelector("[data-display~=submit-flight]");
  var $loader = $root.querySelector("[data-display~=connecting-loader]");
  var $phoneReadingPanels = $root.querySelector("[data-display~=phone-reading-panels]");

  function setLoading(isLoading) {
    $loader.style.display = isLoading ? 'block' : 'none';
    $phoneReadingPanels.style.display = isLoading ? 'none' : 'block';
  }

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
        $submittedMaxAltitude.value = maxAltitude.split(' ')[0];
        if (maxAltitude === '0 m') {
          $submitFlight.disabled = true;
        } else {
          $submitFlight.disabled = false;
        }
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
        this.channel = channel;
      },
      enumerable: true
    },
    uplinkStatus: {
      set: function(status) {
        switch(status.toLowerCase()) {
          case "connecting":
            $uplinkStatus.innerHTML = "Hold on, we're establishing a realtime connection to stream your lob.";
            setLoading(true);
            break;
          case "disconnected":
            $uplinkStatus.innerHTML = "Hold on, we've lost the realtime connection. Trying to reconnect now.";
            setLoading(true);
            break;
          case "failed":
            $uplinkStatus.innerHTML = "Oops, we've failed to establish a realtime connection. Try reloading this app.";
            setLoading(true);
            break;
          case "transmitting":
            $uplinkStatus.innerHTML = "Live streaming this with id <b>" + this.channel + "</b>. <a href='/why-stream'>Why?</a>";
            setLoading(false);
            break;
          default:
            console.error('Unknown status', status);
        }
      },
      enumerable: true
    }
  });

}

export function create($root){ Display($root); }

export default Display;
