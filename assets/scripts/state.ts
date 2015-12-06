var FREEFALL_LIMIT = 4;

var Reading = {
  freefall: function(reading){
    var a = reading.acceleration;
    var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    return magnitude < FREEFALL_LIMIT;
  }
};

interface Reading {
  acceleration: {x: number, y: number, z: number};
  timestamp: number;
}

export interface State {
  currentFlightReadings: Reading[];
  currentReading: Reading;
  flightRecords: Reading[][];
}

export var DEFAULT: State = Object.freeze({
  currentFlightReadings: [],
  currentReading: null,
  flightRecords: []
});
export function handleReset(_state=DEFAULT){
  return DEFAULT;
};
export function handleNewReading(reading: Reading, state=DEFAULT): State{
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
};
