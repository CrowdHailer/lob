/* jshint esnext: true */

import "../client/polyfill";
import "./general-store-test";
import "./store-test";
import "./counter-test";

describe("Client", function() {

  it("should have a passing test", function() {
    expect(true).toEqual(true);
  });

});
