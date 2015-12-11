/* jshint esnext: true */

import Controller from "./controller";
import Display from "./display";
import Presenter from "./presenter";

export default function create($root, app){
  app.accelerometer.start();
  // fetch uplink so that it starts connecting;
  // app.fetchService("uplink");
  var controller = Controller($root, app);

  var display = Display($root);
  var presenter = Presenter(app);

  function update(){
    for (var attribute in display) {
      if (display.hasOwnProperty(attribute)) {
        display[attribute] = presenter[attribute];
      }
    }
  }

  app.onResetReadings(update);
  app.onNewReading(update);
  return {
    update: update
  };
}
