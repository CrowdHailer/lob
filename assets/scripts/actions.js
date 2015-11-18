/*jshint esnext: true */

function Actions(dispatcher) {
  return {
    accelerometerReading: function (reading) {
      return dispatcher.dispatch({
        type: Actions.ACCELEROMETER_READING,
        reading: reading
      });
    }
  };
}

Actions.ACCELEROMETER_READING = "ACCELEROMETER_READING";

export default Actions;
