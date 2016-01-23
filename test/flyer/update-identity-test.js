/* jshint esnext: true */
import { createTranscriptLogger, createTranscriptFunction } from "../support";

import Flyer from "../../client/flyer";

describe("update identity", function(){
  describe("for Flyer with default identity", function(){
    beforeEach(function(){
      flyer = Flyer({
      });
      flyer.logger = createTranscriptLogger();
      flyer.view = {render: function(){}};
      flyer.uplink = {
        transmitIdentity: createTranscriptFunction(),
      };
      flyer.updateIdentity('New identity');
    });
    it("should set new identity", function(){
      expect(flyer.state.identity).toBe('New identity');
    });
    it('should log the change', function(){
      expect(flyer.logger.info.lastCall).toEqual(['Updated identity', 'New identity']);
    });
    it("should transmit the updated identity", function(){
      expect(flyer.uplink.transmitIdentity.lastCall).toEqual(['New identity']);
    });
  });
});
