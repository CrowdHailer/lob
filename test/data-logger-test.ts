import DataLogger from "../assets/scripts/data-logger.ts";

describe("Data Logger", function () {
  var lastUpdate;
  var dataLogger: DataLogger;
  var reading = {timestamp: 100, acceleration: {x: 0, y: 0, z: 10}};

  beforeEach(function () {
    lastUpdate = undefined;
    dataLogger = new DataLogger();
    dataLogger.registerDisplay({update: function(update){ lastUpdate = update; }});
  });

  it("should pass self to a newly registered display", function () {
    expect(lastUpdate).toBe(dataLogger);
  });

  it("should start with an empty collection of readings", function () {
    expect(dataLogger.readings.length).toBe(0);
  });

  it("should start Ready", function () {
    expect(dataLogger.status).toBe(DataLogger.READY);
  });

  it("should not pass updates to displays", function () {
    lastUpdate = undefined;
    dataLogger.newReading(reading);
    expect(lastUpdate).toBeUndefined();
  });

  it("should not add reading to readings collection", function () {
    dataLogger.newReading(reading);
    expect(dataLogger.readings.length).toBe(0);
  });

  it("should have a max altitude of 0", function () {
    dataLogger.newReading(reading);
    expect(dataLogger.maxAltitude).toBe(0);
  });

  it("should be Reading after start", function () {
    dataLogger.start();
    expect(dataLogger.status).toBe(DataLogger.READING);
  });

  it("should pass start update to registered display", function () {
    lastUpdate = undefined;
    dataLogger.start();
    expect(lastUpdate).toBe(dataLogger);
  });

  describe("started datalogger", function() {
    beforeEach(function () {
      dataLogger.start();
    });

    it("should pass updates to displays", function () {
      lastUpdate = undefined;
      dataLogger.newReading(reading);
      expect(lastUpdate).toBe(dataLogger);
    });

    it("should add reading to readings collection", function () {
      dataLogger.newReading(reading);
      expect(dataLogger.readings.length).toBe(1);
    });

    it("should have no readings after reset", function () {
      dataLogger.newReading(reading);
      dataLogger.reset();
      expect(dataLogger.readings.length).toBe(0);
    });

    it("should be ready after reset", function () {
      dataLogger.newReading(reading);
      dataLogger.reset();
      expect(dataLogger.status).toBe(DataLogger.READY);
    });

    it("should pass reset update to registered display", function () {
      lastUpdate = undefined;
      dataLogger.reset();
      expect(lastUpdate).toBe(dataLogger);
    });

    it("should be completed after a stop", function () {
      dataLogger.stop();
      expect(dataLogger.status).toBe(DataLogger.COMPLETED);
    });

    it("should pass stop update to registered display", function () {
      lastUpdate = undefined;
      dataLogger.stop();
      expect(lastUpdate).toBe(dataLogger);
    });

    it("should have a max altitude after being stoped", function () {
      var reading1 = {timestamp: 1000, acceleration: {x: 0, y: 0, z: 1}};
      var reading2 = {timestamp: 2000, acceleration: {x: 0, y: 0, z: 1}};
      dataLogger.newReading(reading1);
      dataLogger.newReading(reading2);
      expect(dataLogger.maxAltitude).toBe(0);
      dataLogger.stop();
      expect(dataLogger.maxAltitude).toBe(1.2);
    });
  });

});
