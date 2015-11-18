/*jshint esnext: true */

import Dispatcher from "../assets/scripts/dispatcher.js";

// catch errors in store dispatch
// Prevent circular dispatch
// Dispatch to all stores
describe("Dispatcher", function() {

  // Log to fake console rather than have last dispatch method
  function FakeStore() {
    var last_action;
    return {
      dispatch: function (action) { last_action = action; },
      getLastAction: function () { return last_action; }
    };
  }

  it("should call all stores with the action", function () {
    var store1 = FakeStore();
    var store2 = FakeStore();
    var dispatcher = Dispatcher([store1, store2]);
    var action = {type: "FAKE_ACTION"};
    dispatcher.dispatch(action);
    expect(store1.getLastAction()).toBe(action);
    expect(store2.getLastAction()).toBe(action);
  });

});
