/* jshint esnext: true */

import * as Client from "./client";
import * as Logger from "./framework/logger";
import { argsToArray } from "./utils/utils";

var logger = {
  debug: function(){
    var args = argsToArray(arguments);
    console.debug.apply(console, args);
  },
  info: function(){
    var args = argsToArray(arguments);
    console.info.apply(console, args);
  },
  warn: function(){
    var args = argsToArray(arguments);
    console.warn.apply(console, args);
  },
  error: function(e){
    var args = argsToArray(arguments);
    var error = args[args.length - 1];
    console.info.apply(console, args);
    throw error;
  }
};

var client = Client.start({
  console: Logger.wrap(logger, {prefix: "Lob client"})
});

import { ready } from "./utils/dom";

import Avionics from "./avionics/avionics";

ready(function(){
  window.display = Avionics(document, client);
});

// function Avionics($root, app){
//   var presenter = Presenter(app);
//   var controller = Controller($root);
//   var display = Display($root)
//   return {
//     refresh: function(){
//       display.keys.forEach(function(){
//         // display.set checks if exists
//         // presenter.fetch checks if exists
//         display[key] = presenter[key];
//       });
//     }
//   };
// }
// var avionics = Avionics.start($root, client);
// client.onNewReading(avionic.update);
// client.onResetReadings(avionic.update);

export default client;
