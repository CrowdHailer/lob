var FREEFALL_LIMIT = 4;

var Reading = {
  freefall: function(reading){
    var a = reading.acceleration;
    var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    return magnitude < FREEFALL_LIMIT;
  }
};

var State = {
  DEFAULT: {
    currentFlightReadings: [],
    currentReading: null,
    flightRecords: []
  },
  handleReset: function(_state=State.DEFAULT){
    return State.DEFAULT;
  },
  handleNewReading: function(reading, state=State.DEFAULT){
    var flightRecords = state.flightRecords;
    var currentFlightReadings = state.currentFlightReadings;

    if (Reading.freefall(reading)){
      currentFlightReadings = currentFlightReadings.concat(reading);
    } else if (currentFlightReadings[0]){
      flightRecords = flightRecords.concat([currentFlightReadings]);
      currentFlightReadings = [];
    }

    return {
      currentFlightReadings: currentFlightReadings,
      currentReading: reading,
      flightRecords: flightRecords
    };
  }
};

describe("State", function(){
  describe("reset", function(){
    it("should return initial state if given undefined state", function(){
      var newState = State.handleReset(undefined);
      expect(newState.currentFlightReadings).toEqual([]);
      expect(newState.currentReading).toEqual(null);
      expect(newState.flightRecords).toEqual([]);
    });
  });

  function freefallReading(timestamp=10000){
    return {
      acceleration: {x: 0, y: 0, z: -1},
      timestamp: timestamp
    };
  };
  function stationaryReading(timestamp=10000){
    return {
      acceleration: {x: 0, y: 0, z: -10},
      timestamp: timestamp
    };
  };

  describe("new reading", function(){
    it("should add reading as currentReading", function(){
      var reading = stationaryReading();
      var newState = State.handleNewReading(reading, State.DEFAULT);

      expect(newState.currentReading).toEqual(reading);
      expect(newState.currentFlightReadings).toEqual([]);
      expect(newState.flightRecords).toEqual([]);
    });

    it("should add to current flight if in freefall", function(){
      var reading = freefallReading();
      var newState = State.handleNewReading(reading, State.DEFAULT);
      expect(newState.currentFlightReadings[0]).toEqual(reading);
    });

    it("should should move current flight to past flightS", function(){
      var readings = [freefallReading(), freefallReading()];
      var reading = stationaryReading();
      var state = State.DEFAULT;
      state.currentFlightReadings = readings;
      var newState = State.handleNewReading(reading, state);
      expect(newState.currentFlightReadings).toEqual([]);
      expect(newState.flightRecords[0]).toEqual(readings);
    });
  });
});
