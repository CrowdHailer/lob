/* jshint esnext: true */

import * as Client from "./client";
import * as Logger from "./framework/logger";
import { argsToArray } from "./utils/utils";

var logger = Object.assign({}, window.console, {error: function(e){
  var args = argsToArray(arguments);
  var error = args[args.length - 1];
  console.info.apply(console, args);
  throw error;
}});

var client = Client.start({
  console: Logger.wrap(logger, {prefix: "Lob client"})
});

var avionics = Avionics.start($root, client);
client.onNewReading(avionic.update);
client.onResetReadings(avionic.update);

export default client;
