/* jshint esnext: true */

import "../client/polyfill";
import "./event-test";
import "./dispatcher-test";
import "./general-store-test";
import "./store-test";
import "./framework-test";

describe("Client", function() {

  it("should have a passing test", function() {
    expect(true).toEqual(true);
  });

});
