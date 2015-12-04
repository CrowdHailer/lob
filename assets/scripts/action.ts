import * as Dispatcher from "./dispatcher.ts";

interface Logger {
  info: (...items) => void;
  error: (...items) => void;
}
var NullLogger = {info: function(...a){ null; }, error: function(...a){ null; }};

export function create(filter: () => void, logger?: Logger): {(): void, register: (handler: ()=> void) => void}
export function create<A, B>(filter: (a: A) => B, logger?: Logger): {(a: A): void, register: (handler: (m: B)=> void) => void}
export function create(filter, logger=NullLogger){
  var action: any;
  var dispatcher = Dispatcher.create();
  action = function(minutiae){
    try {
      dispatcher.dispatch(filter(minutiae));
    }
    catch (e) {
      logger.error(e);
    }
  };
  action.register = function(handler){
    dispatcher = dispatcher.register(handler);
  };
  return action;
};
