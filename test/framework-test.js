/* jshint esnext: true */

import App from "../client/app";
import { createTranscriptFunction, createTranscriptLogger } from "./support";

describe("App", function() {

  it("should be possible to register a service", function() {
    var app = App({});
    expect(function(){
      app.registerService("myService", function(){});
    }).not.toThrow();
  });

  describe("fetching a service", function(){
    var app, factory, logger;

    beforeEach(function(){
      logger = createTranscriptLogger();
      app = App({}, logger);
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

    it("should raise an exception if trying to register a pre-existing service", function(){
      app.registerService("myService", function(){  });

      expect(logger.error.lastCall[0]).toEqual(new TypeError("Service name already registered: myService"));
    });

    it("should raise an exception if trying to fetch a non-existant service", function(){
      app.fetchService("otherService", function(){  });

      expect(logger.error.lastCall[0]).toEqual(new TypeError("Service not found: otherService"));
    });
  });
});
