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
    },
    // DEBT untested
    accelerometerWaiting: function () {
      return dispatcher.dispatch({
        type: Actions.ACCELEROMETER_WAITING,
      });
    },
    // DEBT untested
    startRecording: function () {
      return dispatcher.dispatch({
        type: Actions.START_RECORDING,
      });
    },
    // DEBT untested
    stopRecording: function () {
      return dispatcher.dispatch({
        type: Actions.STOP_RECORDING,
      });
    }
  };
}

Actions.ACCELEROMETER_READING = "ACCELEROMETER_READING";
Actions.ACCELEROMETER_FAILED = "ACCELEROMETER_FAILED";
Actions.ACCELEROMETER_WAITING = "ACCELEROMETER_WAITING";
Actions.START_RECORDING = "START_RECORDING";
Actions.STOP_RECORDING = "STOP_RECORDING";

export default Actions;
