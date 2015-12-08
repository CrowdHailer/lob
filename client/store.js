/* jshint esnext: true */

import { GeneralStore}  from "./general-store";

function resetReadings(state){
  var emptyReadings = {
    current: null,
    currentFlight: [],
    flightRecords: [],
  };
  return Object.assign(state, {readings: emptyReadings});
}

function Store(){
  GeneralStore.call(this, {});
}

Store.prototype = Object.create(GeneralStore.prototype);
Store.prototype.constructor = Store;

Store.prototype.resetReadings = function(){
  this.advance(resetReadings);
  return this;
};

export function create(){
  return new Store();
}
export default create;
