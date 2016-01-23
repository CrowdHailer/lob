/* jshint esnext: true */

// import Presenter from "../../client/avionics/presenter";
// import { format } from "../../client/avionics/presenter";

xdescribe("Avionics Presenter", function(){
  describe("formatting numbers", function(){
    it("should format 0 as '+00.00'", function(){
      expect(format(0)).toBe("+00.00");
    });
    it("should format -1 as '-01.00'", function(){
      expect(format(-1)).toBe("-01.00");
    });
  });

});
