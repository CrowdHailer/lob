/* jshint esnext: true */
function isRational(x, other) {
  if (typeof x !== "number"){
    return false;
  }
  if (!isFinite(x)){
    return false;
  }
  var rest = Array.prototype.slice.call(arguments, 1);
  if (rest.length > 0) {
    return isRational.apply(this, rest);
  }
  return true;
}

function roundtoFour(number) {
  return parseFloat(number.toFixed(4));
}

export default function Reading(raw){
  if ( !(this instanceof Reading) ) { return new Reading(raw); }

  this.x = raw.x;
  this.y = raw.y;
  this.z = raw.z;
  this.timestamp = raw.timestamp;

  if (!isRational(this.x, this.y, this.z, this.timestamp)) {
    throw new TypeError("Reading should have numerical values for x, y, z & timestamp");
  }
}

Object.defineProperty(Reading.prototype, "magnitude", {
  get: function(){
    return roundtoFour(Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z));
  }
});
