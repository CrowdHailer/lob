/* jshint esnext: true */
import * as Event from "./framework/event";

var Logger = {
  wrap: function(console, settings){
    var prefix;
    var notices = [];
    if (settings.prefix){
      prefix = "[" + settings.prefix + "]";
      notices = notices.concat(prefix);
    }
    var argsToArray = function(args){
      return Array.prototype.slice.call(args);
    };
    function debug(){
      console.debug.apply(console, notices.concat(argsToArray(arguments)));
    }
    function info(){
      console.info.apply(console, notices.concat(argsToArray(arguments)));
    }
    function warn(a){
      var args = argsToArray(arguments);
      console.warn.apply(console, notices.concat(args));
    }
    function error(e){
      var args = argsToArray(arguments);
      console.error.apply(console, notices.concat(args));
    }
    return {
      debug: debug,
      info: info,
      warn: warn,
      error: error,
    };
  }
};

function Client(world){
  var console = world.console;
  var events = {
    resetReadings: Event.start(Logger.wrap(world.console, {prefix: "Reset readings"}))
  };

  this.resetReadings = function(){
    events.resetReadings();
  };

  Object.defineProperty(this, "currentReading", {
    get: function(){
      return null;
    }
  });

  Object.defineProperty(this, "currentFlight", {
    get: function(){
      return [];
    }
  });
  Object.defineProperty(this, "flightHistory", {
    get: function(){
      return [];
    }
  });
}

export function start(world){
  return new Client(world);
}
