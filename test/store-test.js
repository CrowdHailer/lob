/* jshint esnext: true */

import { createTranscriptFunction } from "./support";
import Store from "../client/store";

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
