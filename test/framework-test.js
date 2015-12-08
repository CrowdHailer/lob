/* jshint esnext: true */

import App from "../client/app";
import { createTranscriptFunction } from "./support";

describe("App", function() {

  it("should be possible to register a service", function() {
    var app = App();
    expect(function(){
      app.registerService("myService", function(){});
    }).not.toThrow();
  });

  describe("fetching a service", function(){
    it("should start a service when it is fetched", function(){
      var app = App();
      var factory = createTranscriptFunction();
      app.registerService("transcript", factory);

      app.getService("transcript");
      expect(factory.lastCall).toEqual([app]);
    });
  });
});
