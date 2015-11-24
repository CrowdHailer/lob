import Readings from "../assets/scripts/readings.ts";


describe("Empty Readings", function() {

  var emptyDataLog = new Readings();

  it("should have a duration of 0", function () {
    expect(emptyDataLog.duration).toBe(0);
  });

  it("should have a flightTime of 0", function () {
    expect(emptyDataLog.flightTime).toBe(0);
  });

  it("should add a new reading to the list of readings", function() {
    var reading = {acceleration: {x: 0, y: 0, z: 10}, timestamp: 124};
    var newDataLog = emptyDataLog.addReading(reading);
    expect(newDataLog.readings.length).toEqual(1);
  });

});
describe("Running Readings", function() {

  var dataLog = new Readings([
    {acceleration: {x: 0, y: 0, z: 10}, timestamp: 12000},
    {acceleration: {x: 0, y: 0, z: 10}, timestamp: 13500}
  ]);

  it("should have a duration of 1.5 seconds", function () {
    expect(dataLog.duration).toBe(1.5);
  });

  it("should have a flightTime of 0", function () {
    expect(dataLog.flightTime).toBe(0);
  });

  it("should add a new reading to the list of readings", function() {
    var reading = {acceleration: {x: 0, y: 0, z: 10}, timestamp: 124};
    var newDataLog = dataLog.addReading(reading);
    expect(newDataLog.readings.length).toEqual(3);
  });

});
describe("FreeFalling Readings", function() {

  var dataLog = new Readings([
    {acceleration: {x: 0, y: 0, z: 10}, timestamp: 12000},
    {acceleration: {x: 0, y: 0, z: 1}, timestamp: 13500},
    {acceleration: {x: 0, y: 0, z: 1}, timestamp: 14400}
  ]);

  it("should have a flightTime of 0", function () {
    expect(dataLog.flightTime).toBe(0.9);
  });

});
