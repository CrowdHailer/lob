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
    var app, factory;

    beforeEach(function(){
      app = App();
      factory = createTranscriptFunction(function(){
        return {type: "myService"};
      });
      app.registerService("myService", factory);
    });

    it("should start a service when it is fetched", function(){
      app.fetchService("myService");

      expect(factory.lastCall).toEqual([app]);
    });

    it("should return service instance", function(){
      var service = app.fetchService("myService");

      expect(service.type).toEqual("myService");
    });

    it("should use exisiting service if fetched a second time", function(){
      app.fetchService("myService");
      app.fetchService("myService");

      expect(factory.transcript.length).toBe(1);
    });
  });
});
