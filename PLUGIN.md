# Defining a plugin

The following defines a plugin named `foo_bar` in [AMD format](http://requirejs.org/docs/whyamd.html#amd), where `foo` is the namespace and `bar` is the name:

	(function(globals, factory) {
		if (typeof define === 'function' && define.amd) {
			define([ 'bsp-utils' ], factory);

		} else {
			factory(globals.bsp_utils, globals);
		}

	})(this, function(bsp_utils, globals) {
		return bsp_utils.plugin(globals, 'foo', 'bar', {
			'_defaultOptions': { },
			'_install': function() { },
			'_init': function($roots, selector) { },
			'_each': function($item) { },
			'_all': function($items) { },
			'customAction': function() { }
		});
	});

Within any plugin action method, `this` is always set to the plugin object, and that allows access to the other actions (e.g. `this.customAction()`).

## _defaultOptions

`Object`

Contains all the default options for the plugin.

## _install

`function()`

Called once when the plugin is defined.

## _init

`function(Array or HTMLElement roots, String selector)`

Called whenever the plugin is initialized using either `foo_bar.init(roots)` or `foo_bar.live(roots, selector)` before `_each` or `_all` callbacks.

## _each

`function(HTMLElement item)`

Called for each `item` that needs to be initialized.

## _all

`function(Array or HTMLElement items)`

Called once per corresponding `_init` call after all `items` have been initialized using `_each`.

## customAction

If it's a function, it's called as is. Any other type will return the value as is.

## _on

`this._on(Array or HTMLElement roots, String selector, data, Function(Event event) handler)`

Attaches a plugin-specific event `handler` on all elements that match the `selector` within `roots`. When the `handler` is called, `data` will be passed through as a property in `event`.

`this._on(Array or HTMLElement roots, String selector, Function(Event event) handler)`

Attaches a plugin-specific event `handler` on all elements that match the `selector` within `roots`.

`this._on(Array or HTMLElement elements, Function(Event event) handler)`

Attaches a plugin-specific event `handler` on all `elements`.

### _off

`this._off(Array or HTMLElement roots, String events, String selector)`

Detaches all plugin-specific `events` handlers on all elements that match the `selector` within `roots`.

`this._off(Array or HTMLElement elements, String events)`

Detaches all plugin-specific `events` handlers on all `elements`.

`this._off(Array or HTMLElement elements)`

Detaches all plugin-specific event handlers on all `elements`.

### _data

`this._data(Array or HTMLElement elements, String key)`

Returns the plugin-specific data value associated with the first item in `elements` and the `key`.

`this._data(Array or HTMLElement elements, String key, value)`

Sets a plugin-specific data `value` on all `elements` at the `key`.

# Using the plugin

The plugin is automatically initialized on any elements that have `data-foo-bar` attribute. Options can be specified on the `html` or the individual element using the `data-foo-bar-options` attribute.

In addition to the custom actions, the following standard actions are always available:

## init

`foo_bar.init(Array or HTMLElement items, Object options)`

Initializes the plugin on all `items` with the `options`.

## live

`foo_bar.live(Array or HTMLElement roots, String selector, Object options)`

Sets up the plugin to initialize all items that match the `selector` within
all `roots` with the `options`. This ensures that any elements that are inserted into the DOM after this method call are still initialized, similar to how [$.fn.on](http://api.jquery.com/on/) can handle events on new descendant elements.

## option

`foo_bar.option(Array or HTMLElement items)`

Returns all option values associated with the first item in `items`.

`foo_bar.option(Array or HTMLElement items, String key)`

Returns the option value associated with the first item in `items` at the `key`.

`foo_bar.option(Array or HTMLElement items, String key, value)`

Sets the option `value` on all `items` at the `key`.
