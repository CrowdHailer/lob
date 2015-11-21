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
