/*jshint esnext: true */

function deviceUsesInvertedAcceleration(userAgent) {
  if (userAgent.match(/Windows/i)) {
    return true;
  } else if (userAgent.match(/Android/i)) {
    return false;
  } else {
    return true;
  }
}

export function lookupAccelerationVectorRectifyForDevice(userAgent, console) {
  var invert = deviceUsesInvertedAcceleration(userAgent);

  if (invert) {
    console.log("Device uses inverted acceleration. UserAgent: \"" + userAgent + "\"");
    return function invertVector(vector) {
      return {
        x: - 1 * vector.x,
        y: - 1 * vector.y,
        z: - 1 * vector.z,
      };
    };
  } else {
    console.log("Device uses standard acceleration. UserAgent: \"" + userAgent + "\"");
    return function identity(vector) { return vector; };
  }
}
