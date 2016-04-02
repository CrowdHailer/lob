/* jshint esnext: true */

import Projection from "./flyer/projection";
import Reading from "./lib/reading";
import Audio from "./lib/Audio";
import FlyerState from './flyer/state'

/* Class that wraps a reading but has logic
   that allows it to be queried with a nice DSL */

function PeakOrTrough(reading) {
  this.updateReading(reading);
}

PeakOrTrough.prototype.Threshold = { peak: 18, trough: 4, timeWithoutPeakOrTrough: 0.75 };

PeakOrTrough.prototype.exceedThreshold = function() {
  return (this.magnitude < this.Threshold.trough) ||
    (this.magnitude > this.Threshold.peak);
};

PeakOrTrough.prototype.isPeak = function() {
  return this.magnitude > 10;
}

/* A peak for throw will never be around for more than 2 seconds i.e.
   it has to swing back to another peak/trough or to stationery (magnitude 10) */
PeakOrTrough.prototype.isTooOld = function() {
  return this.timestamp < Date.now() - 2000;
}

/* A trough of 3 is less than a trough  of 2
   and a peak of 19 is less than a peak of 22 */
PeakOrTrough.prototype.isLessThan = function(newPeakOrTrough) {
  if (this.magnitude < 10) {
    return newPeakOrTrough.magnitude < this.magnitude;
  } else {
    return newPeakOrTrough.magnitude > this.magnitude;
  }
};

PeakOrTrough.prototype.updateReading = function(reading) {
  this.reading = reading;
  this.magnitude = reading.magnitude;
  this.timestamp = reading.timestamp;
}

export default function Flyer(state) {
  if ( !(this instanceof Flyer) ) { return new Flyer(state); }

  var flyer = this;
  var audio = new Audio();
  var peakOrTroughHistory = [];
  var currentFlightReadings = [];

  state = FlyerState(state || {});
  flyer.state = state;

  flyer.uplinkAvailable = function(channelName) {
    if (flyer.state.uplinkStatus === 'INCOMPATIBLE') { return; }

    flyer.state = flyer.state.merge({
      "uplinkStatus": "TRANSMITTING",
      "uplinkDetails": channelName
    });
    flyer.logger.info("Uplink available, transmission commencing", channelName);
    showcase(flyer.state);
  };

  flyer.uplinkFailed = function(err) {
    if (flyer.state.uplinkStatus === 'INCOMPATIBLE') { return; }

    flyer.state = flyer.state.set("uplinkStatus", "FAILED");
    showcase(flyer.state);
    flyer.logger.error("Uplink failed", err);
  };

  flyer.uplinkDisconnected = function() {
    if (flyer.state.uplinkStatus === 'INCOMPATIBLE') { return; }

    flyer.state = flyer.state.set("uplinkStatus", "DISCONNECTED");
    showcase(flyer.state);
    flyer.logger.warn("Uplink disconnected, will attempt reconnect");
  };

  flyer.newReading = function(raw) {
    raw.timestamp = Date.now();
    var reading = Reading(raw);

    if (isNaN(parseInt(raw.x))) {
      flyer.state = flyer.state.merge({
        "alert": "Accelerometer not found for this device. Please try again on a different mobile",
        "uplinkStatus": "INCOMPATIBLE"
      });
      showcase(flyer.state);
      return;
    }

    transmitReading(reading);
    flyer.view.renderPhoneMovement(raw);

    this.trackThrows(reading, function(currentFlight) {
      var state = flyer.state.set("latestReading", reading);
      var flightHistory = state.flightHistory;

      flightHistory.push(currentFlight);
      flyer.state = state.set({
        "currentFlight": currentFlight,
        "flightHistory": flightHistory
      });

      showcase(flyer.state);

      audio.playDropSound();
      transmitFlightData(flyer.state, currentFlight);
    });
  };

  /****

    Calls the callback with an Array of readings when
    a throw is detected

    A throw is typically a curve in the form
        ---      ---
    ----/   \    /   \-----
            \__/

    What we need to identify is two large peaks or
    troughs with an opposing peak/rought to work
    out how long the throw was and how significant
    it was

  ****/
  flyer.trackThrows = function(reading, callback) {
    var currentPeakOrTrough = new PeakOrTrough(reading);
    var lastPeakOrTrough = peakOrTroughHistory[peakOrTroughHistory.length - 1];

    /* Start recording peaks or troughs, update the extremes of the peaks or
       troughs, and when peak switches to trough or vice versa, add a new
       recorded peak or trough in history */
    if (currentPeakOrTrough.exceedThreshold()) {
      if (!lastPeakOrTrough) {
        peakOrTroughHistory.push(currentPeakOrTrough);
      } else {
        if (currentPeakOrTrough.isPeak() === lastPeakOrTrough.isPeak()) {
          if (lastPeakOrTrough.isLessThan(currentPeakOrTrough)) {
            lastPeakOrTrough.updateReading(currentPeakOrTrough);
          }
        } else {
          peakOrTroughHistory.push(currentPeakOrTrough);
        }
      }
    } else {
      /* We are no longer exceeding a peak or trough
         and we have satisfied the requirements of three peaks */
      if (peakOrTroughHistory.length === 3) {
        callback(currentFlightReadings);
        peakOrTroughHistory = [];
        currentFlightReadings = [];
        return;
      }
    }

    if (lastPeakOrTrough) {
      if (lastPeakOrTrough.isTooOld()) {
        /* This is not a valid throw, clear all history */
        peakOrTroughHistory = [];
        currentFlightReadings = [];
      } else {
        currentFlightReadings.push(reading);
      }
    }
  }

  flyer.newOrientation = function(position) {
    position.timestamp = Date.now();
    transmitOrientation(position);
    flyer.view.renderPhoneOrientation(position);
  }

  flyer.closeAlert = function(){
    // DEBT untested
    flyer.state = flyer.state.set("alert", "");
    showcase(flyer.state);
  };

  function transmitReading(reading){
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      flyer.uplink.transmitReading(reading);
    }
  }

  function transmitOrientation(position){
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      flyer.uplink.transmitOrientation(position);
    }
  }

  function transmitFlightData(state, flightData) {
    if (flyer.state.uplinkStatus === "TRANSMITTING") {
      var projection = Projection(state);
      var data = {
        timestamp: projection.lastFlightTimestamp,
        flightTime: projection.lastFlightTime,
        altitude: projection.lastAltitude,
        flightSerialThisSession: projection.flightCount,
        data: flightData
      }
      flyer.uplink.transmitFlightData(data);
    }
  }

  function showcase(state){
    flyer.view.render(Projection(state));
  }

  // DEBT should be set separatly for Testing
  flyer.clock = window.Date;
}
Flyer.State = FlyerState;
