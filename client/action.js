/* jshint esnext: true */

import * as Dispatcher from "./dispatcher";
import { Logger, NullLogger } from "./utils/logger";



export function create(filter, logger){
  console.log(filter)
  if (logger == void 0) {
    logger = NullLogger;
  }
  var action;
  var dispatcher = Dispatcher.create(logger);
  action = function(minutiae){
    var noDetailWithAction = arguments.length === 0;
    try {
      if (noDetailWithAction) {
        dispatcher.dispatch();
      } else {
        console.log(filter)
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
}
