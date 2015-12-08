/* jshint esnext: true */

function lens(key){
  return function(func){
    return function(obj){
      obj = obj || key;
      var update = {};
      update[key] = func(obj[key]);
      return Object.assign({}, obj, update);
    };
  };
}

var compose = function () {
  var fns = arguments;

  return function (result) {
    for (var i = fns.length - 1; i > -1; i--) {
      result = fns[i].call(this, result);
    }

    return result;
  };
};
