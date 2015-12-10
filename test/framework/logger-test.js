/* jshint esnext: true */

import * as Logger from "../../client/framework/logger";
import { createTranscriptLogger } from "../support";

describe("Logger wrap", function() {
  describe("with prefix", function(){
    var baseLogger = createTranscriptLogger();
    var logger = Logger.wrap(baseLogger, {prefix: "prefix"});

    it("should append prefix to log on debug call", function(){
      logger.debug("log item");

      expect(baseLogger.debug.lastCall).toEqual(["[prefix]", "log item"]);
    });

    it("should append prefix to log on info call", function(){
      logger.info("log item");

      expect(baseLogger.info.lastCall).toEqual(["[prefix]", "log item"]);
    });

    it("should append prefix to log on warn call", function(){
      logger.warn("log item");

      expect(baseLogger.warn.lastCall).toEqual(["[prefix]", "log item"]);
    });

    it("should append prefix to log on error call", function(){
      logger.error("log item");

      expect(baseLogger.error.lastCall).toEqual(["[prefix]", "log item"]);
    });
  });
});

describe("silent logger", function(){
  var logger;
  beforeEach(function(){
    spyOn(console, "debug");
    spyOn(console, "info");
    spyOn(console, "warn");
    spyOn(console, "error");
    logger = Logger.silent;
  });

  it("should not log debug calls", function(){
    logger.debug();
    expect(console.debug).not.toHaveBeenCalled();
  });

  it("should not log info calls", function(){
    logger.info();
    expect(console.info).not.toHaveBeenCalled();
  });

  it("should not log warn calls", function(){
    logger.warn();
    expect(console.warn).not.toHaveBeenCalled();
  });

  it("should throw errors on error calls", function(){
    expect(function(){
      logger.error("an error");
    }).toThrow("an error");
  });
});
