/* jshint esnext: true */

function roundtoFour(number) {
  return parseFloat(number.toFixed(4));
}

export default function Reading(raw, clock){
  if ( !(this instanceof Reading) ) { return new Reading(raw, clock); }

  this.x = raw.x;
  this.y = raw.y;
  this.z = raw.z;
  this.timestamp = clock.now();

  if (typeof this.x !== "number") {
    throw new TypeError("Reading should have numerical values for x, y, z");
  }
}

Object.defineProperty(Reading.prototype, "magnitude", {
  get: function(){
    return roundtoFour(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
  }
});
