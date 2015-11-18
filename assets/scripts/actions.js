/*jshint esnext: true */

function Actions(dispatcher) {
  return {
    accelerometerReading: function (reading) {
      return dispatcher.dispatch({
        type: Actions.ACCELEROMETER_READING,
        reading: reading
      });
    },
    // DEBT untested
    accelerometerFailed: function (error) {
      return dispatcher.dispatch({
        type: Actions.ACCELEROMETER_FAILED,
        error: error
      });
    }
  };
}

Actions.ACCELEROMETER_READING = "ACCELEROMETER_READING";
Actions.ACCELEROMETER_FAILED = "ACCELEROMETER_FAILED";

export default Actions;
