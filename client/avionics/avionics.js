/* jshint esnext: true */

import Events from "../vendor/gator.js";

function Controller($root, app){
  var events = Events($root);
  events.on("click", "[data-command~=reset]", function(evt){
    app.resetReadings();
  });
  events.on("click", "[data-command~=start-transmitting]", function(evt){
    app.startTransmitting();
  });
}
import Display from "./display";
import Presenter from "./presenter";
export default function create($root, app){
  // app.fetchService("accelerometer").start();
  // fetch uplink so that it starts connecting;
  // app.fetchService("uplink");
  console.log("mounting avionics component");
  var controller = Controller($root, app.actions);

  var display = Display($root);
  var presenter = Presenter(app);
  return {
    update: function(){
      for (var attribute in display) {
        if (display.hasOwnProperty(attribute)) {
          display[attribute] = presenter[attribute];
        }
      }
    }
  };
}
