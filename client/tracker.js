/* jshint esnext: true */

// IMPORTS
import Tracker from "./tracker/tracker";
import Router from "./router";
import ConsoleView from "./tracker/console-view";
import Showcase from "./tracker/showcase";
import Reading from "./lib/reading";

// GENERAL CONFIGURATION
window.Tracker = Tracker;
window.Tracker.Reading = Reading;

var router = Router(window.location);
console.log('Router:', 'Started with initial state:', router.state);


var tracker = new Tracker();
tracker.logger = window.console;
tracker.showcase = Showcase(window);

// var consoleView = new ConsoleView(window.console);
// // tracker.showcase.register(consoleView.render);
//
// import UplinkController from "./tracker/uplink-controller";
//
// var uplinkController = new UplinkController({
//   token: uri.query.token,
//   channel: uri.query.channel
// }, tracker);

export default tracker;




// Dom views should be initialized with the ready on certain selectors library
