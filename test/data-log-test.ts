module DataLog {
  export function addReading (state, newReading) {
    state.readings.push(newReading);
    return state;
  }
}
describe("DataLog", function() {

  it("should add a new reading to the list of readings", function() {
    var reading = {acceleration: 5, timestamp: 124};
    var newState = DataLog.addReading({readings: [{}]}, reading);
    expect(newState.readings.length).toEqual(2);
  });

});
