/* jshint esnext: true */

export function wrap(logger, settings){
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
    logger.debug.apply(logger, notices.concat(argsToArray(arguments)));
  }
  function info(){
    console.log(logger)
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


export var DEFAULT = {
  info: function(){  },
  warn: function(){  },
  // error logging should be used for errors and in development these should be thrown
  error: function(e){ throw e; }
};

export var NullLogger = {
  info: function(a){  },
  warn: function(a){  },
  error: function(a){  },
};
