/*jshint esnext: true */

function Dispatcher(stores) {
  return {
    dispatch: function (action) {
      stores.forEach(function (store) { store.dispatch(action); });
    }
  };
}

export default Dispatcher;
