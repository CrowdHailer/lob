/// <reference path="./jasmine.d.ts" />
/*jshint esnext: true */

class Avionics{
  status: String

  start(){
    this.status = Avionics.READING
    return this;
  }

  static new(){
    return new Avionics()
  }
  constructor(){
    this.status = Avionics.READY
  }
  static READY = "READY"
  static READING = "READING"
}

describe("Lob", function() {

  describe("Avionics", function () {

    it("should be created ready", function () {
      var avionics = Avionics.new();
      expect(avionics.status).toBe(Avionics.READY);
    });

    it("should be reading after being started", function () {
      var avionics = Avionics.new().start();
      expect(avionics.status).toBe(Avionics.READING);
    });
  });

  it("should pass a dummy test", function() {
    expect(true).toEqual(true);
  });

});
