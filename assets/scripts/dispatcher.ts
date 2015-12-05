import { NullLogger } from "./logger.ts";

// Raise Error for circular calls
function Dispatcher(handlers, world){
  this.dispatch = function(){
    var args = arguments;
    handlers.forEach(function(handler){
      try {
        handler.apply({}, args);
      } catch(e) {
        world.error(e);
      }
    });

    if (handlers.length == 0) {
      world.warn.apply(world, args);
    } else {
      world.info.apply(world, args);
    }
  };
  this.register = function(handler){
    return new Dispatcher(handlers.concat(handler), world);
  };
};

export function create(world=NullLogger){
  return new Dispatcher([], world);
};
export default Dispatcher;
