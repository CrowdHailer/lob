/* jshint esnext: true */

import Tracker from "./tracker/tracker";
import ConsoleView from "./tracker/console-view";

var tracker = new Tracker();
tracker.logger = window.console;

var consoleView = new ConsoleView(window.console);
tracker.showcase.register(consoleView.render);

import UplinkController from "./tracker/uplink-controller";

import * as URI from "./uri";
var uri = URI.parseLocation(window.location);

var uplinkController = new UplinkController({
  token: uri.query.token,
  channel: uri.query.channel
}, tracker);

export default tracker;



// Dom views should be initialized with the ready on certain selectors library
