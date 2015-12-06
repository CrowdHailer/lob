
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

export interface Logger {
  info: (...items) => void;
  warn: (...items) => void;
  error: (...items) => void;
}

export var DefaultLogger = {
  info: function(...a){ null; },
  warn: function(...a){ null; },
  // error logging should be used for errors and in development these should be thrown
  error: function(e){ throw e; }
};

export var NullLogger = {
  info: function(...a){ null; },
  warn: function(...a){ null; },
  error: function(...a){ null; },
};
