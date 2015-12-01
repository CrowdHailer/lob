import DataLogger from "./data-logger.ts";
import { getParameterByName } from "./utils.ts";
// Display elements are updated with the state of a store when they are registered to the store.
// DEBT the data logger display will cause an error if the elements are not present, this error should be caught by the dispatcher when it is registered
// TODO currently untested
class DataLoggerDisplay {
  $root: Element;
  $flightTime: any;
  $flightTimeInput: any;
  $maxAltitude;
  $maxAltitudeInput;
  $startButton;
  $stopButton;
  $resetButton;
  $submitButton: HTMLFormElement;
  constructor($root){
    this.$root = $root;
    this.$flightTime = $root.querySelector("[data-hook~=flight-time]");
    this.$maxAltitude = $root.querySelector("[data-hook~=max-altitude]");
    this.$startButton = $root.querySelector("[data-command~=start]");
    this.$stopButton = $root.querySelector("[data-command~=stop]");
    this.$resetButton = $root.querySelector("[data-command~=reset]");
    this.$submitButton = $root.querySelector("[data-command~=submit]");
    this.$flightTimeInput = $root.querySelector("[name~=flight-time]");
    this.$maxAltitudeInput = $root.querySelector("[name~=max-altitude]");
    var channel = getParameterByName("channel");
    var $channelName = $root.querySelector("[data-hook~=channel-name]");
    $channelName.innerHTML = "Watch on channel '" + channel + "'";
  }
  update (state) {
    this.$flightTime.innerHTML = state.readings.flightTime + "s";
    this.$flightTimeInput.value = state.readings.flightTime;
    this.$maxAltitude.innerHTML = state.maxAltitude + "m";
    this.$maxAltitudeInput.value = state.maxAltitude;

    if (state.status == DataLogger.READY) {
      this.$startButton.hidden = false;
    } else {
      this.$startButton.hidden = true;
    }
    if (state.status == DataLogger.READING) {
      this.$stopButton.hidden = false;
    } else {
      this.$stopButton.hidden = true;
    }
    if (state.status == DataLogger.COMPLETED) {
      this.$resetButton.hidden = false;
      this.$submitButton.style.display = "";
    } else {
      this.$resetButton.hidden = true;
      this.$submitButton.style.display = "none";
    }
  }
}

export default DataLoggerDisplay
