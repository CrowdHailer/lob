/* jshint esnext: true */

import * as GeneralStore from "../client/general-store";
import * as reducers from "./counter-reducers";

var Counter = GeneralStore.factory(reducers);
describe("Counter", function() {

  it("should have a passing test", function() {
    var counter = Counter(10);
    counter.add(3).subtract(11);

    expect(counter.state).toEqual(2);
  });

});
