/*jshint esnext: true */

import Accelerometer from "../assets/scripts/accelerometer.js";
import { AccelerometerError } from "../assets/scripts/accelerometer.js";

describe("Accelerometer", function() {

  var last_action;
  var actions = {
    accelerometerFailed: function (error) {
      last_action = {
        type: "ACCELEROMETER_FAILED",
        error: error
      };
    },
    accelerometerWaiting: function () {
      last_action = {
        type: "ACCELEROMETER_WAITING"
      };
    }
  };

  beforeEach(function () {
    last_action = undefined;
  });

  describe("when device motion unsupported", function () {
    var context = {};

    it("should not be possible to set state value", function () {
      accelerometer = Accelerometer(actions, context);
      expect(function () {
        accelerometer.state = "MUTATED";
      }).toThrowError(TypeError, "setting a property that has only a getter");
    });

    it("should be in a failed state", function () {
      accelerometer = Accelerometer(actions, context);
      expect(accelerometer.state).toBe(Accelerometer.FAILED);
    });

    it("should be have an error", function () {
      accelerometer = Accelerometer(actions, context);
      expect(accelerometer.error.constructor).toEqual(AccelerometerError);
    });

    it("should report failure as action", function () {
      accelerometer = Accelerometer(actions, context);
      expect(last_action.type).toEqual("ACCELEROMETER_FAILED");
    });

    it("should throw the appropriate error when started", function () {
      accelerometer = Accelerometer(actions, context);
      var error = accelerometer.error;
      expect(accelerometer.start).toThrow(error);
    });
  });

  describe("when device motion supported", function () {

    var last_callback;
    var context = {
      DeviceMotionEvent: function () { },
      addEventListener: function (event, cb) { last_callback = cb; },
      removeEventListener: function (event, cb) { }
    };

    beforeEach(function () {
      last_callback = undefined;
    });

    it("should start in a pending state", function () {
      accelerometer = Accelerometer(actions, context);
      expect(accelerometer.state).toBe(Accelerometer.PENDING);
    });

    it("should raise an error if started", function () {
      accelerometer = Accelerometer(actions, context);
      expect(accelerometer.start).toThrowError(AccelerometerError);
    });

    it("should be in a failed state if first event has null data", function () {
      accelerometer = Accelerometer(actions, context);
      last_callback({accelerationIncludingGravity: {}});
      expect(accelerometer.state).toBe(Accelerometer.FAILED);
      // DEBT separate assertion
      expect(accelerometer.error.constructor).toEqual(AccelerometerError);
      expect(last_action.type).toEqual("ACCELEROMETER_FAILED");
    });

    it("should be in a waiting state if first event has data", function () {
      accelerometer = Accelerometer(actions, context);
      last_callback({accelerationIncludingGravity: {x: 1, y: 2, z: 5}});
      expect(accelerometer.state).toBe(Accelerometer.WAITING);
      // DEBT separate assertion
      expect(accelerometer.error).toBeUndefined();
      expect(last_action.type).toEqual("ACCELEROMETER_WAITING");
    });
  });
});
