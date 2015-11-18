/*jshint esnext: true */

import Actions from "../assets/scripts/actions.js";

describe("Actions", function() {

  var last_action;
  var dispatcher = {
    dispatch: function (action) { last_action = action; }
  };

  it("should define an accelerometer reading constant", function () {
    expect(Actions.ACCELEROMETER_READING).toBeDefined();
  });

  it("should dispatch an accelerometer reading", function() {
    var actions = Actions(dispatcher);
    var reading = {vector: {}, timestamp: 123};

    actions.accelerometerReading(reading);
    expect(last_action.type).toEqual(Actions.ACCELEROMETER_READING);
    expect(last_action.reading).toEqual(reading);
  });

});
