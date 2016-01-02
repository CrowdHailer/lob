/* jshint esnext: true */

import { createTranscriptLogger, createTranscriptFunction } from "../support";
import Flyer from "../../client/flyer/flyer";

describe("Initialising Flyer", function(){
  it("should require an valid initial state", function(){
    expect(function(){
      Flyer("invalid state");
    }).toThrowError(TypeError, "Flyer did not recieve valid initial state");
  });
});
describe("Initialised Flyer", function(){
  var flyer;
  beforeEach(function(){
    flyer = Flyer();
  });
  it("should be an instance of Flyer", function(){
    expect(flyer instanceof Flyer).toBe(true);
  });
  it("should have an initial state", function(){
    // DEBT check it is infact initial state
    // expect(flyer.state).toBe(Flyer.State.initial());
    expect(flyer.state instanceof Flyer.State).toBe(true);
  });
  // Testing implementation detail but i dont better than undefined is not object
  // it("should throw an error if accessing logger", function(){
  //   expect(function(){
  //     var logger = flyer.logger;
  //   }).toThrowError(TypeError, "Flyer is missing logger");
  // });
});
