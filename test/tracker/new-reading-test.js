/* jshint esnext: true */
import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Tracker from "../../client/tracker/tracker";

describe("New grounded reading", function(){
  var tracker, world, reading;
  beforeEach(function(){
    world = {
      logger: createTranscriptLogger()
    };
    tracker = Tracker({liveFlight: [{}]}, world);
    tracker.showcase = {
      update: function(){},
      addReading: function(){}
    };
    reading = {};
    tracker.newReading(reading);
  });
  it("should add the latest reading to live flight", function(){
    expect(tracker.state.liveFlight[1]).toBe(reading);
  });
  xit("should start timeout", function(){
    // Dont know how to isolate this
    // probably call a controller
  });
});
