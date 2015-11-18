/*jshint esnext: true */

export function querySelector(selector, element) {
  return element.querySelector(selector);
}

export function component(componentName, element) {
  return querySelector("[data-component~=" + componentName + "]", element);
}

export function querySelectorAll(selector, element) {
  return Array.prototype.slice.call(element.querySelectorAll(selector));
}

export function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
