
export function create (prefix){
  prefix = "[" + prefix + "]";
  var notices = [prefix];
  return {
    info: function(..._){
      var args = Array.prototype.slice.call(arguments);
      console.info.apply(console, notices.concat(args));
    },
    error: function(..._){
      var args = Array.prototype.slice.call(arguments);
      console.error.apply(console, notices.concat(args));
    }
  };
}

export interface Logger {
  info: (...items) => void;
  error: (...items) => void;
}

export var NullLogger = {info: function(...a){ null; }, error: function(...a){ null; }};
