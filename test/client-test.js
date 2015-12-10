/* jshint esnext: true */

import "../client/polyfill";
import "./event-test";
import "./dispatcher-test";
import "./general-store-test";
import "./store-test";
import "./framework-test";

import Client from "../client/client";
describe("Client", function() {

  it("should have a passing test", function() {
    expect(true).toEqual(true);
  });

  // APP tests

  // it("should have a null current reading after reset", function(){
  //   Client.resetReadings();
  //   expect(Client.store.state.readings.current).toBe(null);
  // });

});
