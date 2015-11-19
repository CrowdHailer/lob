/// <reference path="./jasmine.d.ts" />
/*jshint esnext: true */

interface AvionicsState{
  status: String
  data: Array<any>
  remainingTime: Number
  // Time: Number
}

var AvionicsState = {
  start: function(state: AvionicsState){ state.status = Avionics.READING; },
  new: function (): AvionicsState {
    return {status: Avionics.READY, data: [], remainingTime: Avionics.MAX_RECORDING_DURATION};
  }
}

class Avionics{
  state: AvionicsState

  static start(avionics: Avionics){
    AvionicsState.start(avionics.state)
    return avionics;
  }

  static new(){
    return new Avionics()
  }
  constructor(){
    this.state = AvionicsState.new()
  }
  static READY = "READY"
  static READING = "READING"
  static MAX_RECORDING_DURATION = 20
}

describe("Lob", function() {

  describe("AvionicsState", function () {
    it("should start with no data", function () {
      var state = AvionicsState.new();
      expect(state.data.length).toBe(0);
    });

    it("should all remaining flight time", function () {
      var state = AvionicsState.new();
      expect(state.remainingTime).toBe(Avionics.MAX_RECORDING_DURATION);
    });
  })
  describe("Created Avionics", function () {
    var avionics;
    beforeEach(function(){
      avionics = Avionics.new();
    })

    it("should be ready", function () {
      expect(avionics.state.status).toBe(Avionics.READY);
    });

    it("should be reading after being started", function () {
      Avionics.start(avionics)
      expect(avionics.state.status).toBe(Avionics.READING);
    });
  });

  it("should pass a dummy test", function() {
    expect(true).toEqual(true);
  });

});
