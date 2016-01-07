/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Tracker from "../../client/tracker/tracker";

describe("Tracker with unknown uplink status", function(){
  var tracker, logger;
  beforeEach(function(){
    tracker = new Tracker({uplinkStatus: "UNKNOWN"}, {});
    tracker.logger = createTranscriptLogger();
    tracker.showcase = {
      update: function(){}
    };
  });
  describe("responding to uplinkAvailable", function(){
    beforeEach(function(){
      tracker.uplinkAvailable();
    });
    it("should have uplink status available", function(){
      expect(tracker.state.uplinkStatus).toBe("AVAILABLE");
    });
    xit("should have reported the change as info", function(){
      expect(tracker.logger.info.lastCall).toEqual(["[Uplink Available]"]);
    });
  });
});
