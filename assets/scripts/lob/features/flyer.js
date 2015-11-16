/*jshint esnext: true */

import { querySelector } from "../dom";

export default function Flyer($root) {
  console.log("Starting feature: \"Flyer\"");

  var $startButton = querySelector("#start", $root);
  $startButton.addEventListener("click", function (event) {
    var startEvent = new CustomEvent('startReporting', {bubbles: true});
    $root.dispatchEvent(startEvent);
  });
  var $stopButton = querySelector("#stop", $root);
  $stopButton.addEventListener("click", function (event) {
    var stopEvent = new CustomEvent('stopReporting', {bubbles: true});
    $root.dispatchEvent(stopEvent);
  });
  var $refreshButton = querySelector("#refresh", $root);
  $refreshButton.addEventListener("click", function (event) {
    var refreshEvent = new CustomEvent('refreshReporting', {bubbles: true});
    $root.dispatchEvent(refreshEvent);
  });
}
