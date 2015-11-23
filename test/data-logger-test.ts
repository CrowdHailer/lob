import DataLogger from "../assets/scripts/data-logger.ts";

describe("Data Logger", function () {
  var lastUpdate;
  var dataLogger: DataLogger;

  beforeEach(function () {
    lastUpdate = undefined;
    dataLogger = new DataLogger();
    dataLogger.registerDisplay({update: function(update){ lastUpdate = update; }});
  });

  it("should pass state to a newly registered display", function () {
    expect(lastUpdate).toBe(dataLogger);
  });

  it("should start with an empty collection of readings", function () {
    expect(dataLogger.readings.length).toBe(0);
  });

  it("should pass updates to registered display", function () {
    lastUpdate = undefined;
    dataLogger.newReading(5);
    expect(lastUpdate).toBe(dataLogger);
  });

  it("should add reading to readings collection", function () {
    dataLogger.newReading(5);
    expect(dataLogger.readings.length).toBe(1);
  });

  it("should have no readings after reset", function () {
    dataLogger.newReading(5);
    dataLogger.reset();
    expect(dataLogger.readings.length).toBe(0);
  });
});
