console.log("Starting boot ...");

import Events from "./gator.js";

class AvionicsInterface {
  private $root;
  private actions;
  constructor ($root, actions) {
    this.$root = $root;
    this.actions = actions;
    var events = Events($root, null);
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

import { ready } from "./dom.ts";
ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionicsInterface = new AvionicsInterface($avionics, {});
});

export default {};
