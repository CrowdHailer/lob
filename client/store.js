/* jshint esnext: true */

import * as GeneralStore from "./framework/general-store";
import * as StateUpdates from "./state";

var Store = GeneralStore.enhance(StateUpdates);

export default Store;
