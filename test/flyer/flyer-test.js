/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction, freefallReading } from "../support";
import Flyer from "../../client/flyer/flyer";

describe("Initialising Flyer", function(){
  it("should require an valid initial state", function(){
    expect(function(){
      Flyer("invalid state");
    }).toThrowError(TypeError, "Flyer did not recieve valid initial state");
  });
});
describe("Initialised Flyer", function(){
  var flyer;
  beforeEach(function(){
    flyer = Flyer();
  });
  it("should be an instance of Flyer", function(){
    expect(flyer instanceof Flyer).toBe(true);
  });
  xit("should have an initial state", function(){
    // DEBT check it is infact initial state
    // expect(flyer.state).toBe(Flyer.State.initial());
    expect(flyer.state instanceof Flyer.State).toBe(true);
  });
  // Testing implementation detail but i dont better than undefined is not object
  // it("should throw an error if accessing logger", function(){
  //   expect(function(){
  //     var logger = flyer.logger;
  //   }).toThrowError(TypeError, "Flyer is missing logger");
  // });
});
describe("Flyer with unknown uplink status", function(){
  var flyer, logger;
  beforeEach(function(){
    flyer = Flyer({uplinkStatus: "UNKNOWN"});
    flyer.logger = createTranscriptLogger();
    flyer.view = {render: createTranscriptFunction()};
  });
  describe("responding to uplinkAvailable", function(){
    var uplinkDetails;
    beforeEach(function(){
      uplinkDetails = {channelName: "TEST", token: "longAndRandom"};
      flyer.uplinkAvailable(uplinkDetails);
    });
    it("should have uplink status available", function(){
      expect(flyer.state.uplinkStatus).toBe("AVAILABLE");
    });
    it("should have uplink details", function(){
      expect(flyer.state.uplinkDetails).toBe(uplinkDetails);
    });
    it("should have reported the change as info", function(){
      expect(flyer.logger.info.lastCall).toEqual(["Uplink Available", uplinkDetails]);
    });
    it("should have called for the view to be rerendered", function(){
      // DEBT test projection
      expect(flyer.view.render.transcript.length).toBe(1);
    });
  });
  describe("responding to uplinkFailed", function(){
    beforeEach(function(){
      flyer.uplinkFailed();
    });
    it("should have uplink status available", function(){
      expect(flyer.state.uplinkStatus).toBe("FAILED");
    });
    it("should have reported the change as info", function(){
      expect(flyer.logger.info.lastCall).toEqual(["[Uplink Failed]"]);
    });
    it("should have called for the view to be rerendered", function(){
      // DEBT test projection
      expect(flyer.view.render.transcript.length).toBe(1);
    });
  });
});
describe("Flyer in flight", function(){
  var flyer, logger;
  beforeEach(function(){
    flyer = Flyer({
      uplinkStatus: "AVAILABLE",
      currentFlight: [{}],
      flightHistory: [{}],
    });

    flyer.view = {render: function(){}};
    flyer.logger = createTranscriptLogger();
  });
  describe("responding to new freefall reading", function(){
    var reading;
    beforeEach(function(){
      reading = {x: 0, y: 0, z: 0};
      flyer.newReading(reading);
    });
    it("should replace latest reading", function(){
      expect(flyer.state.latestReading.magnitude).toBe(0);
    });
    it("should add reading to current flight", function(){
      expect(flyer.state.currentFlight[1].magnitude).toEqual(0);
    });
  });
  describe("responding to new grounded reading", function(){
    var reading;
    beforeEach(function(){
      reading = {x: 0, y: 0, z: 10};
      flyer.newReading(reading);
    });
    // it("should replace latest reading", function(){
    //   expect(flyer.state.latestReading).toBe(reading);
    // });
    it("should clear current flight", function(){
      expect(flyer.state.currentFlight).toEqual([]);
    });
    it("should add current flight to flight history", function(){
      expect(flyer.state.flightHistory[1]).toEqual([{}]);
    });
  });
  describe("responding to reset readings", function(){
    beforeEach(function(){
      flyer.resetReadings();
    });
    it("should clear latest reading", function(){
      expect(flyer.state.latestReading).toBe(null);
    });
    it("should clear current flight", function(){
      expect(flyer.state.currentFlight).toEqual([]);
    });
    it("should clear flight history", function(){
      expect(flyer.state.flightHistory).toEqual([]);
    });
  });
});

describe("grounded flyer", function(){
  var flyer, logger;
  beforeEach(function(){
    flyer = Flyer({
      uplinkStatus: "AVAILABLE",
      currentFlight: [],
      flightHistory: [{}],
    });
    flyer.view = {render: function(){}};
    flyer.logger = createTranscriptLogger();
  });
  describe("responding to new freefall reading", function(){
    var reading;
    beforeEach(function(){
      reading = {x: 0, y: 0, z: 0};
      flyer.newReading(reading);
    });
    // it("should replace latest reading", function(){
    //   expect(flyer.state.latestReading).toBe(reading);
    // });
    // it("should add reading to current flight", function(){
    //   expect(flyer.state.currentFlight[1]).toEqual(reading);
    // });
  });
  describe("responding to new grounded reading", function(){
    var reading;
    beforeEach(function(){
      reading = {x: 0, y: 0, z: 10};
      flyer.newReading(reading);
    });
    // it("should replace latest reading", function(){
    //   expect(flyer.state.latestReading).toBe(reading);
    // });
    // it("should clear current flight", function(){
    //   expect(flyer.state.currentFlight).toEqual([]);
    // });
    it("should not add current flight to flight history", function(){
      expect(flyer.state.flightHistory[1]).toEqual(undefined);
    });
  });
});
describe("Quiet(not transmitting) Flyer", function(){
  var flyer;
  beforeEach(function(){
    flyer = Flyer({uplinkStatus: "AVAILABLE"});
    flyer.logger = createTranscriptLogger();
    flyer.uplink = {
      transmitReading: createTranscriptFunction()
    };
    flyer.view = {render: createTranscriptFunction()};
  });
  describe("responding to new Reading", function(){
    var reading;
    beforeEach(function(){
      reading = {x: 0, y: 0, z: 0};
      flyer.newReading(reading);
    });
    it("should have called for the view to be rerendered", function(){
      // DEBT test projection
      expect(flyer.view.render.transcript.length).toBe(1);
    });
    // it("should have reported the change as info", function(){
    //   expect(flyer.logger.info.lastCall).toEqual(["[New Reading]"]);
    // });
    it("should not transmit the new reading", function(){
      expect(flyer.uplink.transmitReading.transcript).toEqual([]);
    });
  });
});
describe("Transmitting Flyer", function(){
  var flyer;
  beforeEach(function(){
    flyer = Flyer({uplinkStatus: "TRANSMITTING"});
    // flyer.logger = null logger
    flyer.uplink = {
      transmitReading: createTranscriptFunction()
    };
    flyer.view = {render: function(){}};
  });
  describe("responding to new Reading", function(){
    var reading;
    beforeEach(function(){
      flyer.clock = {
        now: function(){ return 213; }
      };
      flyer.newReading({x:0, y: 0, z: 0});
    });
    it("should transmit the new reading", function(){
      expect(flyer.uplink.transmitReading.transcript[0][0].timestamp).toEqual(213);
    });
  });
});
