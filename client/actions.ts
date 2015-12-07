import * as Action from "../assets/scripts/action.ts";
import * as Logger from "../assets/scripts/logger.ts";

export default {
  newReading: Action.create(function(a: any){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(){ null; }, Logger.create("Reset")),
  badReading: Action.create(function(reading: any){ return reading; }, Logger.create("Bad Reading")),

  uplinkAvailable: Action.create(function(){ null; }, Logger.create("Uplink Available")),
  startStreaming: Action.create(function(){ null; }, Logger.create("Start Streaming")),
  failedConnection: Action.create(function(reason: any){ return reason; }, Logger.create("Failed Connection")),

  closeNotice: Action.create(function(reading: any){ return reading; }, Logger.create("Notice Closed")),
};
