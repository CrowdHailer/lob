import { streak } from "./utils.ts";

class Readings {
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
    return new Readings(this.readings.concat(newReading));
  }
}

export default Readings;
