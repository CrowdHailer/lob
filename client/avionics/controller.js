/* jshint esnext: true */

import Events from "../vendor/gator.js";

export default function Controller($root, app){
  var events = Events($root);
  events.on("click", "[data-command~=reset]", function(evt){
    app.resetReadings();
  });
  events.on("click", "[data-command~=start-transmitting]", function(evt){
    app.startTransmitting();
  });
}
