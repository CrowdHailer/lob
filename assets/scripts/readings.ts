import { streak } from "./utils.ts";

export interface Vector {
  x: number;
  y: number;
  z: number;
}

export interface Reading {
  acceleration: Vector;
  timestamp: number;
}

class Readings {
  readings: Reading[];
  constructor(readings: Reading[] = []) {
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
    var streaks = streak(function (reading: Reading) {
      var a = reading.acceleration;
      var magnitude = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
      return magnitude < 4;
    }, this.readings);
    var flightDurations = streaks.map(function (list) {
      var last = list.length;
      var t0 = list[0].timestamp;
      var t1 = list[last - 1].timestamp;
      // DEBT remove magic numbers
      return (t1 + 250 - t0) / 1000;
    });
    var flightDuration = Math.max.apply(null, flightDurations);
    return Math.max(0, flightDuration);
  }
  get length() {
    return this.readings.length;
  }
  addReading (newReading: Reading) {
    return new Readings(this.readings.concat(newReading));
  }
}

export default Readings;
