# Installation

Using [Bower](http://bower.io/):

`bower install bsp-utils`

Manually:

- Download [jQuery 1.7.0 or above](http://jquery.com/download/)
- Download [bsp-utils.js](https://raw.githubusercontent.com/perfectsense/brightspot-js-utils/master/bsp-utils.js)

# Usage

## onDomInsert

`bsp_utils.onDomInsert(String selector, Object callbacks)`

Triggers the given `callbacks` when an element matching the given `selector` is inserted into the DOM. The `callbacks` argument can contain:

- `Function(Array or HTMLElement items) beforeInsert`
- `Function(HTMLElement item) insert`
- `Function(Array or HTMLElement items) afterInsert`

This method is most often used to implement a plugin that works like a [Web Component](http://www.w3.org/TR/components-intro/) ([demo](http://perfectsense.github.io/brightspot-js-utils/on-dom-insert.html)).

## plugin

See the separate [plugin documentation](PLUGIN.md).

## throttle

`bsp_utils.throttle(Number interval, Function throttledFunction)`

Throttles the given `throttledFunction` so that it executes at most given `interval` (in milliseconds). This method is most often used to rate-limit noisy events like `scroll` ([demo](http://perfectsense.github.io/brightspot-js-utils/throttle.html)).

## debounce

`bsp_utils.debounce(Number wait, Function debouncedFunction, Boolean immediate)`

Debounces the given `debouncedFunction` so that it postpones the execution of the code for the given `wait` (in milliseconds). If `immediate` is truthy, the function is executed at the beginning of the debounce. An example usage of debouncing is, in a lazy-loaded UI, often you want to prevent double-clicks on a "load more" button from firing 2 requests to the server.
