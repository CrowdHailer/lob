import { streak } from "../assets/scripts/utils.ts";

class DataLog {
  readings;
  constructor(readings: {acceleration: any, timestamp: any}[] = []) {
    this.readings = readings;
  }
  get duration(){
    if (this.readings.length === 0) {
      return 0;
    }
    var last = this.readings.length;
    var t0 = this.readings[0].timestamp;
    var t1 = this.readings[last - 1].timestamp;
    return (t1 - t0) / 1000;
  }
  get flightTime(){
    var streaks = streak(function (reading) {
      return reading.acceleration.magnitude < 2;
    }, this.readings);
    var flightDurations = streaks.map(function (list) {
      var last = list.length;
      var t0 = list[0].timestamp;
      var t1 = list[last - 1].timestamp;
      return (t1 - t0) / 1000;
    });
    var flightDuration = Math.max.apply(null, flightDurations);
    return Math.max(0, flightDuration);
  }
  addReading (newReading) {
    return new DataLog(this.readings.concat(newReading));
  }
}
describe("Empty DataLog", function() {

  var emptyDataLog = new DataLog();

  it("should have a duration of 0", function () {
    expect(emptyDataLog.duration).toBe(0);
  });

  it("should have a flightTime of 0", function () {
    expect(emptyDataLog.flightTime).toBe(0);
  });

  it("should add a new reading to the list of readings", function() {
    var reading = {acceleration: 5, timestamp: 124};
    var newDataLog = emptyDataLog.addReading(reading);
    expect(newDataLog.readings.length).toEqual(1);
  });

});
describe("Running DataLog", function() {

  var dataLog = new DataLog([{acceleration: 5, timestamp: 12000}, {acceleration: 5, timestamp: 13500}]);

  it("should have a duration of 1.5 seconds", function () {
    expect(dataLog.duration).toBe(1.5);
  });

  it("should have a flightTime of 0", function () {
    expect(dataLog.flightTime).toBe(0);
  });

  it("should add a new reading to the list of readings", function() {
    var reading = {acceleration: 5, timestamp: 124};
    var newDataLog = dataLog.addReading(reading);
    expect(newDataLog.readings.length).toEqual(3);
  });

});
describe("FreeFalling DataLog", function() {

  var dataLog = new DataLog([
    {acceleration: {magnitude: 9}, timestamp: 12000},
    {acceleration: {magnitude: 1}, timestamp: 13500},
    {acceleration: {magnitude: 1}, timestamp: 14400}
  ]);

  it("should have a flightTime of 0", function () {
    expect(dataLog.flightTime).toBe(0.9);
  });

});
