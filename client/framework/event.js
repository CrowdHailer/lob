/* jshint esnext: true */

import * as Dispatcher from "./dispatcher";
import { silent } from "./logger";
import { argsToArray } from "../utils/utils";


// Simply a stateful dispatcher
export function start(logger){
  if (logger == void 0) { logger = silent; }

  var dispatcher = Dispatcher.create(logger);

  var action = function(){
    var args = argsToArray(arguments);
    dispatcher.dispatch.apply({}, args);
  };
  action.register = function(handler){
    dispatcher = dispatcher.register(handler);
  };

  return action;
}
