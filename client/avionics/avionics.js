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

export default function create($root, app){
  app.fetchService("accelerometer").start();
  // fetch uplink so that it starts connecting;
  app.fetchService("uplink");
  console.log("mounting avionics component");
  var controller = Controller($root, app.actions);
}



function Co(element, app){



  return {
    update: function(_ignore){
      var p = Presenter.create(app)
      for (var attribute in p) {
        if (object.hasOwnProperty(attribute)) {
          view[attribute] = p[attribute];
        }
      }
    }
  }
}
