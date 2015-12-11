/* jshint esnext: true */

import * as Client from "./client";
import * as Logger from "./framework/logger";
import { argsToArray } from "./utils/utils";

var client = Client.start({
  console: Logger.wrap(Logger.development, {prefix: "Lob client"})
});

import { ready } from "./utils/dom";

import Avionics from "./avionics/avionics";

ready(function(){
  window.display = Avionics(document, client);
});

export default client;
