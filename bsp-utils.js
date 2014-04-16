(function(globals, factory) {
    if (typeof define === 'function' && define.amd) {
        define([ 'jquery' ], factory);

    } else {
        globals.bsp_utils = factory(globals.jQuery);
    }

})(this, function($) {
    var bsp_utils = { };

    // Throttles execution of a function.
    (function() {
        bsp_utils.throttle = function(interval, throttledFunction) {
            if (interval <= 0) {
                return throttledFunction;
            }

            var lastTrigger = 0;
            var timeout;
            var lastArguments;

            return function() {
                lastArguments = arguments;

                // Already scheduled to run.
                if (timeout) {
                    return;
                }

                var context = this;
                var now = +$.now();
                var delay = interval - now + lastTrigger;

                // Waited long enough so execute.
                if (delay <= 0) {
                    lastTrigger = now;
                    throttledFunction.apply(context, lastArguments);

                // Schedule for later.
                } else {
                    timeout = setTimeout(function() {
                        lastTrigger = now;
                        timeout = null;
                        throttledFunction.apply(context, lastArguments);
                    }, delay);
                }
            };
        };
    })();

    // Detects inserts into the DOM.
    (function() {
        var domInserts = [ ];
        var insertedClassNamePrefix = 'bsp-onDomInsert-inserted-';
        var insertedClassNameIndex = 0;

        // Execute all callbacks on any new elements.
        function doDomInsert(domInsert) {
            var insertedClassName = domInsert.insertedClassName;
            var $items = domInsert.$roots.find(domInsert.selector).filter(':not(.' + insertedClassName + ')');

            if ($items.length > 0) {
                $items.addClass(insertedClassName);

                var callbacks = domInsert.callbacks;
                var beforeInsert = callbacks.beforeInsert;
                var insert = callbacks.insert;
                var afterInsert = callbacks.afterInsert;

                if (beforeInsert) {
                    beforeInsert($.makeArray($items));
                }

                if (insert) {
                    $items.each(function() {
                        insert(this);
                    });
                }

                if (afterInsert) {
                    afterInsert($.makeArray($items));
                }
            }
        }

        bsp_utils.onDomInsert = function(roots, selector, callbacks) {
            var insertedClassName = insertedClassNamePrefix + insertedClassNameIndex;

            ++ insertedClassNameIndex ;

            var domInsert = {
                '$roots': $(roots),
                'insertedClassName': insertedClassName,
                'selector': selector,
                'callbacks': callbacks
            };

            // Execute callbacks on already existing elements first.
            $(document).ready(function() {
                doDomInsert(domInsert);
            });

            domInserts.push(domInsert);
        };

        // Try to detect DOM mutations efficiently.
        var mutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        function redoAllDomInserts() {
            $.each(domInserts, function(i, domInsert) {
                doDomInsert(domInsert);
            });
        }

        if (mutationObserver) {
            new mutationObserver(bsp_utils.throttle(1, redoAllDomInserts)).observe(document, {
                'childList': true,
                'subtree': true
            });

        // But if not available, brute-force it.
        } else {
            setInterval(redoAllDomInserts, 1000 / 60);
        }
    })();

    // Defines a plugin.
    (function() {
        var NOT_WHITE_RE = /\S+/g;
        var OPTIONS_DATA_KEY = '_options';

        var $d = $(document);

        bsp_utils.plugin = function(globals, namespace, name, actions) {
            var plugin = actions || { };

            plugin._name = namespace + '_' + name;

            plugin._classNamePrefix = namespace + '-' + name + '-';
            plugin._rootClassName = plugin._classNamePrefix + 'root';
            plugin._itemClassName = plugin._classNamePrefix + 'item';

            // Event handling.
            function renameEvents(events) {
                return $.map(events.match(NOT_WHITE_RE), function(s) {
                    return s + '.' + plugin._name;
                }).join(' ');
            }

            plugin._on = function(elements, events, selectorOrHandler, dataOrHandler, handler) {
                var $elements = $(elements);
                events = renameEvents(events);

                if (handler) {
                    $elements.on(events, selectorOrHandler, dataOrHandler, handler);

                } else if (dataOrHandler) {
                    $elements.on(events, selectorOrHandler, dataOrHandler);

                } else {
                    $elements.on(events, selectorOrHandler);
                }
            };

            plugin._off = function(elements, events, selector) {
                var $elements = $(elements);

                if (selector) {
                    $elements.off(renameEvents(events), selector);

                } else if (events) {
                    $elements.off(renameEvents(events));

                } else {
                    $elements.off('.' + plugin._name);
                }
            };

            // Private data.
            plugin._dataKeyPrefix = namespace + '-' + name + '-';

            plugin._data = function(elements, key, value) {
                var $elements = $(elements);

                if ($elements.length === 0) {
                    return null;

                } else {
                    key = plugin._dataKeyPrefix + key;

                    if (value === undefined) {
                        return $.data($elements[0], key);

                    } else {
                        return $elements.each(function() {
                            $.data(this, key, value);
                        });
                    }
                }
            };

            // Options.
            plugin.option = function(elements, key, value) {
                var plugin = this;

                if (typeof key === 'undefined') {
                    return plugin._data(elements, OPTIONS_DATA_KEY) || { };

                } else if (typeof value === 'undefined') {
                    return (plugin._data(elements, OPTIONS_DATA_KEY) || { })[key];

                } else {
                    $(elements).each(function() {
                        var options = plugin._data(this, OPTIONS_DATA_KEY);

                        if (!options) {
                            options = { };
                            plugin._data(this, OPTIONS_DATA_KEY, options);
                        }

                        options[key] = value;
                    });

                    return null;
                }
            };

            plugin._attrName = 'data-' + namespace + '-' + name;
            plugin._attrNamePrefix = plugin._attrName + '-';
            plugin._optionsAttrName = plugin._attrNamePrefix + 'options';

            function updateOptions($element, parentOptions) {
                var elementOptions = $element.attr(plugin._optionsAttrName);

                plugin._data($element[0], OPTIONS_DATA_KEY, elementOptions ?
                        $.extend(true, { }, parentOptions, $.parseJSON(elementOptions)) :
                        parentOptions);
            }

            // Initialization.
            plugin.live = function(elements, selector, options) {
                var $elements = $(elements);
                var $roots = $();

                // Convert document node to its root element and make sure not to
                // include any elements that are already initialized.
                $elements.each(function() {
                    var $root = $(this);
                    var $rootElement = this.nodeType === 9 ? $(this.documentElement) : $root;

                    if (!$rootElement.hasClass(plugin._rootClassName)) {
                        $roots = $roots.add($root);

                        $rootElement.addClass(plugin._rootClassName);
                        updateOptions($rootElement, $.extend(true, { }, plugin._defaultOptions, options));
                    }
                });

                if ($roots.length === 0) {
                    return;
                }

                var init = plugin._init;
                var each = plugin._each;
                var all = plugin._all;

                if (init) {
                    init.call(plugin, $.makeArray($roots), selector);
                }

                if (each || all) {
                    if (selector) {
                        bsp_utils.onDomInsert($.makeArray($roots), selector, {
                            'insert': function(item) {
                                var $item = $(item);
                                var rootOptions = plugin.option($item.closest('.' + plugin._rootClassName));

                                $item.addClass(plugin._itemClassName);
                                updateOptions($item, rootOptions);

                                if (each) {
                                    each.call(plugin, item);
                                }
                            },

                            'afterInsert': !all ? $.noop : function(items) {
                                all.call(plugin, items);
                            }
                        });
                    }
                }
            };

            plugin.init = function(elements, options) {
                plugin.live(elements, null, options);
            };

            // One-time installation callback.
            if (plugin._install) {
                plugin._install();
            }

            // Automatically initialize.
            $d.ready(function() {
                plugin.live(document, '[' + plugin._attrName + ']');
            });

            if (globals) {
                globals[plugin._name] = plugin;
            }

            return plugin;
        };
    })();

    return bsp_utils;
});
