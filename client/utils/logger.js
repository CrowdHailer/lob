/* jshint esnext: true */


export function create (prefix){
  prefix = "[" + prefix + "]";
  var notices = [prefix];
  return {
    info: function(..._){
      var args = Array.prototype.slice.call(arguments);
      console.info.apply(console, notices.concat(args));
    },
    warn: function(..._){
      var args = Array.prototype.slice.call(arguments);
      console.warn.apply(console, notices.concat(args));
    },
    // error: function(..._){
    //   var args = Array.prototype.slice.call(arguments);
    //   console.error.apply(console, notices.concat(args));
    // }
    error: function(e){ throw e; }
  };
}

export function Development(options, logger){
  var prefix;
  var notices = [];
  if (options.prefix){
    prefix = "[" + options.prefix + "]";
    notices = notices.concat(prefix);
  }
  var argsToArray = function(args){
    return Array.prototype.slice.call(args);
  };
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
    throw e;
  }
  return {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
  };
}

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
