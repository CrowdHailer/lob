// All code relating to manipulations requiring a document, element or window node.

export function ready(fn: () => any) {
  if (document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}
