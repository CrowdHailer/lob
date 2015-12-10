/* jshint esnext: true */

import * as Client from "./client";
import * as Logger from "./framework/logger";
var client = Client.start({
  console: Logger.wrap(window.console, {prefix: "Lob client"})
});

export default client;
