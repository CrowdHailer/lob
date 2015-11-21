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
      actions.startLogging();
    });
    events.on("click", "[data-command~=stop]", function (evt: Event) {
      actions.stopLogging();
    });
    events.on("click", "[data-command~=reset]", function (evt: Event) {
      actions.clearDataLog();
    });
  }
}

class Actions {
  dataLogger;
  startLogging(){
    this.dataLogger.start();
  }
  stopLogging(){
    console.info("stopLogging");
  }
  clearDataLog(){
    console.info("clearDataLog");
  }
}

var actions = new Actions();

class DataLogger {
  state = {status: "READY"}; // RECORDING, COMPLETED
  displays = [];
  start () {
    console.info("hello from datalogger");
    var state = this.state;
    this.displays.forEach(function (view) {
      view.update(state);
    });
  }
}

var dataLogger = new DataLogger();

actions.dataLogger = dataLogger;

class DataLoggerDisplay {
  update (state) {
    console.log(state);
  }
}

var dataLoggerDisplay = new DataLoggerDisplay();
dataLogger.displays.push(dataLoggerDisplay);

import { ready } from "./dom.ts";
ready(function () {
  var $avionics = document.querySelector("[data-interface~=avionics]");
  var avionicsInterface = new AvionicsInterface($avionics, actions);
});

export default {};
