import * as Dispatcher from "./dispatcher.ts";
import { Logger, NullLogger } from "./logger.ts";


export function create(filter: () => void, logger?: Logger): {(): void, register: (handler: ()=> void) => void}
export function create<A, B>(filter: (a: A) => B, logger?: Logger): {(a: A): void, register: (handler: (m: B)=> void) => void}

export function create(filter, logger=NullLogger){
  var action: any;
  var dispatcher = Dispatcher.create(logger);
  action = function(minutiae){
    var noDetailWithAction = arguments.length == 0;
    try {
      if (noDetailWithAction) {
        dispatcher.dispatch();
      } else {
        dispatcher.dispatch(filter(minutiae));
      }
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
