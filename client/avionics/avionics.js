/* jshint esnext: true */

import Controller from "./controller";
import Display from "./display";
import Presenter from "./presenter";

export default function create($root, app){
  // app.fetchService("accelerometer").start();
  // fetch uplink so that it starts connecting;
  // app.fetchService("uplink");
  console.log("mounting avionics component");
  var controller = Controller($root, app);

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
