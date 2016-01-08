/* jshint esnext: true */

import Reading from "../../client/lib/reading";

describe("Initialised Reading", function(){
  var reading, raw, clock;
  beforeEach(function(){
    raw = {x: 1, y: 2, z: 3, timestamp: 1234567};
    reading = Reading(raw);
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
    expect(reading.timestamp).toBe(1234567);
  });
  it("should have calculated magnitude", function(){
    // Math.sqrt(1 + 4 + 9) = 3.741657387
    expect(reading.magnitude).toBe(3.7417);
  });
});
describe("Invalid Reading", function(){
  it("cannot be constructed without x number", function(){
    expect(function(){
      Reading({x: null, y: 2, z: 3, timestamp: 12345});
    }).toThrowError(TypeError, /Reading should have numerical values/);
  });
  it("cannot be constructed without y number", function(){
    expect(function(){
      Reading({x: 1, y: null, z: 3, timestamp: 12345});
    }).toThrowError(TypeError, /Reading should have numerical values/);
  });
  it("cannot be constructed without z number", function(){
    expect(function(){
      Reading({x: 1, y: 2, z: null, timestamp: 12345});
    }).toThrowError(TypeError, /Reading should have numerical values/);
  });
  it("cannot be constructed without timestamp number", function(){
    expect(function(){
      Reading({x: 1, y: 2, z: 3, timestamp: null});
    }).toThrowError(TypeError, /Reading should have numerical values/);
  });
  it("cannot be constructed with NaN as x", function(){
    expect(function(){
      Reading({x: NaN, y: 2, z: 3, timestamp: 12345});
    }).toThrowError(TypeError, /Reading should have numerical values/);
  });
  it("cannot be constructed with Infinity as x", function(){
    expect(function(){
      Reading({x: Infinity, y: 2, z: 3, timestamp: 12345});
    }).toThrowError(TypeError, /Reading should have numerical values/);
  });
});
