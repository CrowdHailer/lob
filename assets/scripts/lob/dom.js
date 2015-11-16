/*jshint esnext: true */

export function querySelector(selector, element) {
  return element.querySelector(selector);
}

export function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
