/* jshint esnext: true */

import Events from "../vendor/gator.js";

function Controller($root, app){
  var events = Events($root);
  events.on("click", "[data-command~=reset]", function(evt){
    app.resetReadings();
  });
}

export default function create($root, app){
  app.fetchService("accelerometer").start();
  app.fetchService("uplink").startTransmission();
  console.log("mounting avionics component");
  var controller = Controller($root, app.actions);
}
