/*jshint esnext: true */

export function throttle(fn, threshhold, scope) {
  threshhold = threshhold || 250;
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

export function streak(predicate, collection) {
  var current_streak = [];
  var output = [];
  collection.forEach(function (item) {
    if (predicate(item)) {
      current_streak.push(item);
    } else {
      if (current_streak.length !== 0) {
        output.push(current_streak);
      }
      current_streak = [];
    }
  });
  if (current_streak.length !== 0) {
    output.push(current_streak);
  }
  return output;
}
