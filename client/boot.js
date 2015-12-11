/* jshint esnext: true */

import * as Client from "./client";
import * as Logger from "./framework/logger";
import { argsToArray } from "./utils/utils";

var client = Client.start({
  console: Logger.wrap(Logger.development, {prefix: "LOB"})
});

import { ready } from "./utils/dom";

import Avionics from "./avionics/avionics";
import Notices from "./notices/notices";

ready(function(){
  var $avionics = document.querySelector("[data-interface~=avionics]");
  window.avionics = Avionics($avionics, client);

  var $notices = document.querySelector("[data-component~=notices]");
  window.notices = Notices($notices, client);
});

export default client;
