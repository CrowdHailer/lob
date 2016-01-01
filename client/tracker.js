/* jshint esnext: true */

import Tracker from "./tracker/tracker";

var tracker = new Tracker();
tracker.logger = window.console;

import UplinkController from "./tracker/uplink-controller";

import * as URI from "./uri";
var uri = URI.parseLocation(window.location);

var uplinkController = new UplinkController({
  token: uri.query.token,
  channel: uri.query.channel
}, tracker);

export default tracker;
//
// var State = {
//   fromUri: function(uri){
//     return {
//       token: uri.query["token"],
//       channelName: uri.query["channel"],
//
//     };
//   }
// };
//
//
// function ConsoleView(logger){
//   function wrap(projection){
//     return "listening on: " + projection.channel + " with token: " + projection.token;
//     // returns presentation
//   }
//
//   this.render = function(projection){
//     logger.info(wrap(projection));
//   };
// }
//
// function Projection(){
//   // Could be past console
//   var views = [];
//   var projection;
//   this.update = function(state){
//     // return projection
//     projection = {
//       channel: state.channelName,
//       token: state.token.slice(0, 4) + "..."
//     };
//   };
//   this.watch = function(view){
//     view(projection);
//     views.push(view);
//   };
// }
//
// var tracker = new Tracker();
// tracker.projection = new Projection();
// tracker.applyState(State.fromUri(uri));
// // tracker.init()
//
// var consoleView = new ConsoleView(window.console);
// tracker.watchProjection(consoleView.render);
// // Dom views should be initialized with the ready on certain selectors library
//
