/*jshint esnext: true */

import Accelerometer from "../assets/scripts/accelerometer.js";

describe("Accelerometer", function() {

  it("should have a current state", function () {
    var context = {
      DeviceMotionEvent: function () { },
      addEventListener: function () { }
    };
    accelerometer = Accelerometer(context);
    expect(accelerometer.state).toBeDefined();
  });

  it("should start in a pending state", function () {
    var context = {
      DeviceMotionEvent: function () { },
      addEventListener: function () { }
    };
    accelerometer = Accelerometer(context);
    expect(accelerometer.state).toBe(Accelerometer.PENDING);
  });

  xit("should not be possible to set state value", function () {
    accelerometer = Accelerometer();
    expect(function () {
      accelerometer.state = "MUTATED";
    }).toThrowError(TypeError, "setting a property that has only a getter");
  });

  xit("should be in a failed state if no DeviceMotionEvent defined", function () {
    var context = {};
    accelerometer = Accelerometer(context);
    expect(accelerometer.state).toBe(Accelerometer.FAILED);
  });

});
