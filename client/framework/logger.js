/* jshint esnext: true */
import { argsToArray } from "../utils/utils";

export function wrap(logger, settings){
  var prefix;
  var notices = [];
  if (settings.prefix){
    prefix = "[" + settings.prefix + "]";
    notices = notices.concat(prefix);
  }
  function debug(){
    logger.debug.apply(logger, notices.concat(argsToArray(arguments)));
  }
  function info(){
    logger.info.apply(logger, notices.concat(argsToArray(arguments)));
  }
  function warn(a){
    var args = argsToArray(arguments);
    logger.warn.apply(logger, notices.concat(args));
  }
  function error(e){
    var args = argsToArray(arguments);
    logger.error.apply(logger, notices.concat(args));
  }
  return {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
  };
}

export var silent = {
  debug: function(){  },
  info: function(){  },
  warn: function(){  },
  // error logging should be used for errors and in development these should be thrown
  error: function(e){ throw e; }
};

export var development = {
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

export var NullLogger = {
  info: function(a){  },
  warn: function(a){  },
  error: function(a){  },
};
