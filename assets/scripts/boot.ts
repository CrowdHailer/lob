console.log("Starting boot ...");

import Events from "./gator.js";

class AvionicsInterface {
  private $root;
  private actions;
  constructor ($root, actions) {
    this.$root = $root;
    this.actions = actions;
    // DEBT this should be initialize with $root not document.
    var events = Events(document, null);
    events.on("click", "[data-command~=start]", function (evt: Event) {
      console.log(evt.target);
    });
    events.on("click", "[data-command~=stop]", function (evt: Event) {
      console.log(evt.target);
    });
    events.on("click", "[data-command~=reset]", function (evt: Event) {
      console.log(evt.target);
    });
  }
}

var $avionics = document.querySelector("[data-interface~=avionics]");
var avionicsInterface = new AvionicsInterface($avionics, {});

export default {};
