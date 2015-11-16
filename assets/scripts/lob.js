function lookupAccelerationVectorRectifyForDevice(userAgent) {
  var invert;
  if (userAgent.match(/Windows/i)) {
    invert = true;
  } else if (userAgent.match(/Android/i)) {
    invert = false;
  } else {
    invert = true;
  }

  if (invert) {
    return function invertVector(vector) {
      return {
        x: - 1 * vector.x,
        y: - 1 * vector.y,
        z: - 1 * vector.z,
      };
    };
  } else {
    return function identity(vector) { return vector; };
  }
}

var rectifyAcceleration = lookupAccelerationVectorRectifyForDevice(navigator.userAgent);
