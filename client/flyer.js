/* jshint esnext: true */
import Flyer from "./flyer/flyer";
import Presenter from "./avionics/presenter";
import Display from "./avionics/display";

var flyer = new Flyer();
flyer.logger = window.console;
flyer.view = {
  render: function(projection){
    var presentation = Presenter(projection);
    console.log("ola", presentation);
    var $avionics = document.querySelector("[data-interface~=avionics]");
    var display = new Display($avionics);
    console.log($avionics);
    for (var attribute in display) {
        console.log(presentation[attribute])
      if (display.hasOwnProperty(attribute)) {
        // display[attribute] = presenter[attribute];
      }
    }
  }
};

var DEVICEMOTION = "devicemotion";
function AccelerometerController(global, flyer){
  global.addEventListener(DEVICEMOTION, function(deviceMotionEvent){
    console.debug("AccelerometerController", deviceMotionEvent);
    flyer.newReading({
      acceleration: deviceMotionEvent.accelerationIncludingGravity,
      timestamp: Date.now()
    });
  });
}

var accelerometerController = new AccelerometerController(window, flyer);
