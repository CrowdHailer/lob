/*jshint esnext: true */

import * as $ from "./dom";

function AvionicsConsole($root) {
  var $startButton = $.querySelector("[data-hook~=start]", $root);
  var $stopButton = $.querySelector("[data-hook~=stop]", $root);
  var $resetButton = $.querySelector("[data-hook~=reset]", $root);
  var $countdown = $.querySelector("[data-hook~=countdown]", $stopButton);

  $startButton.addEventListener("click", function (e) {
    var startEvent = new CustomEvent('startRecording', {bubbles: true});
    $root.dispatchEvent(startEvent);
  });

  return Object.create({
    update: function (avionics) {
      if (avionics.state == "PENDING") {
        $startButton.disabled = true;
      } else {
        $startButton.disabled = false;
      }

      if (avionics.state == "RECORDING") {
        $startButton.hidden = true;
      } else {
      }

      if (avionics.state == "RECORDING") {
        $stopButton.hidden = false;
      } else {
        $stopButton.hidden = true;
      }

      if (avionics.state == "COMPLETED") {
        $resetButton.hidden = false;
      } else {
        $resetButton.hidden = true;
      }

      if (avionics.remainingTime) {
        $countdown.innerHTML = avionics.remainingTime + "s";
      }
    }
  }, {

  });
}


export default AvionicsConsole;
