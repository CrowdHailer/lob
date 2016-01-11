/* jshint esnext: true */

export function argsToArray(args){
  return Array.prototype.slice.call(args);
}

export function throttle(fn, threshhold, scope) {
  threshhold = threshhold;
  var last,
  deferTimer;
  return function () {
    var context = scope || this;
    var now = Date.now(), args = arguments;

    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}
