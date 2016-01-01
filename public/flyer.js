(function () { 'use strict';

  function Flyer(){
    this.newReading = function(reading){
      console.log("new reading", reading);
    };
  }

  var flyer = new Flyer();

  var DEVICEMOTION = "devicemotion";
  function AccelerometerController(global, flyer){
    global.addEventListener(DEVICEMOTION, function(){
      flyer.newReading();
    });
  }

  var accelerometerController = new AccelerometerController(window, flyer);

})();
//# sourceMappingURL=flyer.js.map