/* jshint esnext: true */
import "./polyfill";
import * as Action from "./action";
import * as Logger from "./utils/logger";

export default {
  newReading: Action.create(function(a){ return a; }, Logger.create("New Reading")),
  resetReadings: Action.create(function(a){ return a; }, Logger.create("Reset")),
  badReading: Action.create(function(a){ return a; }, Logger.create("Bad Reading")),

  uplinkAvailable: Action.create(function(a){ return a; }, Logger.create("Uplink Available")),
  startTransmitting: Action.create(function(a){ return a; }, Logger.create("Start Transmitting")),
  failedConnection: Action.create(function(a){ return a; }, Logger.create("Failed Connection")),

  closeNotice: Action.create(function(a){ return a; }, Logger.create("Notice Closed")),
};
