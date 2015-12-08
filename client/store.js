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

// import * as GeneralStore from "./generalstore";
//
// var EMPTY_READINGS = {
//   current: null,
//   currentFlight: [],
//   flightRecords: [],
// };
//
// export function resetReadings(state){
//   return EMPTY_READINGS;
// }
//
// var Store = GeneralStore.factory({
//   resetReadings: lens("readings")(resetReadings)
// });
//
// export function create(){
//   return new Store({});
// }
// export default create;
