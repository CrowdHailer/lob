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

function Avionics($root, app){
  var presenter = Presenter(app);
  var controller = Controller($root);
  var display = Display($root)
  return {
    refresh: function(){
      display.keys.forEach(function(){
        // display.set checks if exists
        // presenter.fetch checks if exists
        display[key] = presenter[key];
      });
    }
  };
}
// var avionics = Avionics.start($root, client);
// client.onNewReading(avionic.update);
// client.onResetReadings(avionic.update);

export default client;
