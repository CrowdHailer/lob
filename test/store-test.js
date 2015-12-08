import { GeneralStore}  from "../client/general-store";
import { createTranscriptFunction } from "./support";

function Store(){
  var store = Object.create(GeneralStore());

  store.resetReadings = function(){
    store.advance(resetReadings);
    return this;
  };
  return store;
}


function resetReadings(state){
  var emptyReadings = {
    current: null,
    currentFlight: [],
    flightRecords: [],
  };
  return Object.assign(state, {readings: emptyReadings});
}

describe("store", function() {

  it("should have no current reading after reset", function() {
    var store = Store().resetReadings();
    expect(store.state.readings).toEqual({
      current: null,
      currentFlight: [],
      flightRecords: [],
    });
  });

});
