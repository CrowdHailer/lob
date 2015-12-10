/* jshint esnext: true */

import { DEFAULT } from "../utils/logger";

// Raise Error for circular calls
function Dispatcher(handlers, console){
  this.dispatch = function(){
    var args = arguments;
    handlers.forEach(function(handler){
      try {
        handler.apply({}, args);
      } catch(e) {
        console.error(e);
      }
    });

    if (handlers.length === 0) {
      console.warn.apply(console, args);
    } else {
      console.info.apply(console, args);
    }
  };
  this.register = function(handler){
    return new Dispatcher(handlers.concat(handler), console);
  };
};

export function create(console){
  if (console == void 0) {
    console = DEFAULT;
  }
  return new Dispatcher([], console);
};
export default Dispatcher;
