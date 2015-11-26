// TODO test
class ActionDispatcher<Action> {
  listeners = [];
  addListener(listener: (action?: Action) => void){
    this.listeners = this.listeners.concat(listener);
  }
  dispatch(action?: Action){
    if (this.listeners.length == 0) {
      console.warn("no listeners");
    } else {
      this.listeners.forEach(function(listener){ listener(action); });
    }
  }
}

export default ActionDispatcher
