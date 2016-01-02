/* jshint esnext: true */

import Reading from "../client/lib/reading";

describe("Initialised Reading", function(){
  var reading, raw, clock;
  beforeEach(function(){
    raw = {x: 1, y: 2, z: 3};
    clock = {now: function(){ return 1234567; }};
    reading = Reading(raw, clock);
    // console.log
  });
  it("should have the raw x value", function(){
    expect(reading.x).toBe(raw.x);
  });
  it("should have the raw y value", function(){
    expect(reading.y).toBe(raw.y);
  });
  it("should have the raw z value", function(){
    expect(reading.z).toBe(raw.z);
  });
  it("should have timestamp", function(){
    expect(reading.timestamp).toBe(clock.now());
  });
  it("should have calculated magnitude", function(){
    // Math.sqrt(1 + 4 + 9) = 3.741657387
    expect(reading.magnitude).toBe(3.7417);
  });
});
