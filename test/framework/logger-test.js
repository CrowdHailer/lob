/* jshint esnext: true */

import * as Logger from "../../client/framework/logger";
import { createTranscriptLogger } from "../support";

describe("Logger", function() {
  describe("wrap with prefix", function(){
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
