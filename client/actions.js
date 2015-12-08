/* jshint esnext: true */
import "./polyfill";
import * as Action from "./action";
import * as Logger from "./utils/logger";

export default {
  newReading: Action.create(Function.I, Logger.create("New Reading")),
  resetReadings: Action.create(Function.I, Logger.create("Reset")),
  badReading: Action.create(Function.I, Logger.create("Bad Reading")),

  uplinkAvailable: Action.create(Function.I, Logger.create("Uplink Available")),
  startStreaming: Action.create(Function.I, Logger.create("Start Streaming")),
  failedConnection: Action.create(Function.I, Logger.create("Failed Connection")),

  closeNotice: Action.create(Function.I, Logger.create("Notice Closed")),
};
