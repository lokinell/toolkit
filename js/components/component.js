define([
    '../class',
    '../extensions/aria',
    '../extensions/conceal',
    '../extensions/reveal',
    '../extensions/toolkit'
], function(Toolkit) {

Toolkit.Component = Toolkit.Class.extend(function() {}, {
    component: 'Component',
    version: '1.4.1',

    /** Is the component enabled? */
    enabled: false,

    /** Events and functions to bind */
    events: {},

    /** Cached requests by URL */
    cache: {},

    /** Dynamic options generated at runtime */
    runtime: {},

    /**
     * Create the element from the template.
     *
     * @returns {jQuery}
     */
    createElement: function() {
        var template, options = this.options;

        // Use another element as the template
        if (options.templateFrom) {
            template = $(options.templateFrom);
        }

        // From a string
        if ((!template || !template.length) && options.template) {
            template = $(options.template);

            if (template.length) {
                template.conceal().appendTo('body');
            }
        }

        if (!template) {
            throw new Error('Failed to create template element');
        }

        // Add a class name
        if (options.className) {
            template.addClass(options.className);
        }

        // Enable animations
        if (options.animation) {
            template.addClass(options.animation);
        }

        // Set a flag so we know if the element was created or embedded
        this.created = true;

        return template.attr('id', this.id());
    },

    /**
     * Loop through the events object map and attach events to the specific selector in the correct context.
     * Take into account window, document, and delegation.
     *
     * @param {String} type
     */
    bindEvents: function(type) {
        var self = this,
            options = this.options,
            event,
            keys,
            context,
            selector,
            funcs,
            win = $(window),
            doc = $(document);

        // event window = func          Bind window event
        // event document = func        Bind document event
        // ready document = func        Bind DOM ready event
        // event property = func        Bind event to collection that matches class property
        // event context .class = func  Bind delegated events to class within context
        $.each(this.events, function(key, value) {
            funcs = $.isArray(value) ? value : [value];

            // Replace tokens
            key = key.replace('{mode}', options.mode);
            key = key.replace('{selector}', self.nodes ? self.nodes.selector : '');

            // Extract arguments
            keys = key.split(' ');
            event = keys.shift();
            context = keys.shift();
            selector = keys.join(' ').replace('@', Toolkit.vendor);

            // Determine the correct context
            if (self[context]) {
                context = self[context];
            } else if (context === 'window') {
                context = win;
            } else if (context === 'document') {
                context = doc;
            }

            $.each(funcs, function(i, func) {
                if (!$.isFunction(func)) {
                    func = self[func];
                }

                // Ready events
                if (event === 'ready') {
                    doc.ready(func);

                // Delegated events
                } else if (selector) {
                    $(context)[type](event, selector, func);

                // Regular events
                } else {
                    $(context)[type](event, func);
                }
            });
        });
    },

    /**
     * Destroy the component by disabling events, removing elements, and deleting the component instance.
     */
    destroy: function() {
        this.fireEvent('destroy');

        // Remove active state
        if (this.hide) {
            this.hide();
        }

        if (this.doDestroy) {
            this.doDestroy();
        }

        // Remove events
        this.disable();

        // Remove element only if it was created
        if (this.created) {
            this.element.remove();
        }

        // Remove instances
        var key = this._keyName();

        // This must be called last or else the previous commands will fail
        if (this.nodes) {
            this.nodes.removeData('toolkit.' + key);

            // Remove the cached instance also
            delete Toolkit.cache[key + '.' + this.nodes.selector];

        } else if (this.element) {
            this.element.removeData('toolkit.' + key);
        }
    },

    /**
     * Disable the component.
     */
    disable: function() {
        if (this.enabled) {
            this.bindEvents('off');
        }

        this.enabled = false;
    },

    /**
     * Enable the component.
     */
    enable: function() {
        if (!this.enabled) {
            this.bindEvents('on');
        }

        this.enabled = true;
    },

    /**
     * Trigger an event if it exists.
     *
     * @param {String} type
     * @param {Array} [args]
     */
    fireEvent: function(type, args) {
        if (!$.isArray(args)) {
            args = [args];
        }

        // Trigger event globally
        var onType = 'on' + type.charAt(0).toUpperCase() + type.slice(1);

        if (this.options[onType]) {
            this.options[onType].apply(this, args || []);
        }

        // Generate the namespaced event
        var element = this.element,
            node = this.node,
            event = jQuery.Event(type + '.toolkit.' + this._keyName());
            event.context = this;

        // Trigger event on the element and the node
        if (element && element.length) {
            element.trigger(event, args || []);
        }

        if (node && node.length) {
            node.trigger(event, args || []);
        }
    },

    /**
     * Generate a unique CSS class name for the component and its arguments.
     *
     * @returns {String}
     */
    id: function() {
        var list = $.makeArray(arguments);
            list.unshift('toolkit', this._cssClass(), this.uid);

        return list.join('-');
    },

    /**
     * Inherit options from the target elements data attributes.
     *
     * @param {Object} options
     * @param {jQuery} element
     * @returns {Object}
     */
    inheritOptions: function(options, element) {
        var key, value, obj = {};

        for (key in options) {
            if (key === 'context' || key === 'template') {
                continue;
            }

            value = element.data((this._keyName() + '-' + key).toLowerCase());

            if ($.type(value) !== 'undefined') {
                obj[key] = value;
            }
        }

        return $.extend(true, {}, options, obj);
    },

    /**
     * Enable events and trigger init callback.
     */
    initialize: function() {
        this.enable();
        this.fireEvent('init');
    },

    /**
     * Handle and process non-HTML responses.
     *
     * @param {*} content
     */
    process: function(content) {
        this.hide();

        if (content.callback) {
            var namespaces = content.callback.split('.'),
                func = window, prev = func;

            for (var i = 0; i < namespaces.length; i++) {
                prev = func;
                func = func[namespaces[i]];
            }

            func.call(prev, content);
        }

        this.fireEvent('process', content);
    },

    /**
     * Read a class option from a data attribute.
     * If no attribute exists, return the option value.
     *
     * @param {jQuery} element
     * @param {String} key
     * @returns {*}
     */
    readOption: function(element, key) {
        var value = element.data((this._keyName() + '-' + key).toLowerCase());

        if ($.type(value) === 'undefined') {
            value = this.options[key];
        }

        return value;
    },

    /**
     * Attempt to read a value from an element using the query.
     * Query can either be an attribute name, or a callback function.
     *
     * @param {jQuery} element
     * @param {String|Function} query
     * @returns {String}
     */
    readValue: function(element, query) {
        if (!query) {
            return null;
        }

        element = $(element);

        if ($.type(query) === 'function') {
            return query.call(this, element);
        }

        return element.attr(query);
    },

    /**
     * Request data from a URL and handle all the possible scenarios.
     *
     * @param {Object} options
     * @param {Function} before
     * @param {Function} done
     * @param {Function} fail
     * @returns {jqXHR}
     */
    requestData: function(options, before, done, fail) {
        var url = options.url || options;

        // Set default options
        var ajax = $.extend({}, {
            url: url,
            type: 'GET',
            context: this,
            beforeSend: before || function() {
                this.cache[url] = true;
                this.element
                    .addClass('is-loading')
                    .aria('busy', true);
            }
        }, options);

        // Inherit base options
        if ($.type(this.options.ajax) === 'object') {
            ajax = $.extend({}, this.options.ajax, ajax);
        }

        var cache = (ajax.type.toUpperCase() === 'GET' && this.options.cache);

        return $.ajax(ajax)
            .done(done || function(response, status, xhr) {
                this.element
                    .removeClass('is-loading')
                    .aria('busy', false);

                // HTML
                if (xhr.getResponseHeader('Content-Type').indexOf('text/html') >= 0) {
                    if (cache) {
                        this.cache[url] = response;
                    } else {
                        delete this.cache[url];
                    }

                    this.position(response);

                // JSON, others
                } else {
                    delete this.cache[url];

                    this.process(response);
                }
            })
            .fail(fail || function() {
                delete this.cache[url];

                this.element
                    .removeClass('is-loading')
                    .addClass('has-failed')
                    .aria('busy', false);

                this.position(Toolkit.messages.error);
            });
    },

    /**
     * Set the options by merging with defaults.
     *
     * @param {Object} [options]
     * @param {jQuery} [inheritFrom]
     * @returns {Object}
     */
    setOptions: function(options, inheritFrom) {
        var opts = $.extend(true, {}, Toolkit[this.component].options, options || {});

        // Inherit from element data attributes
        if (inheritFrom) {
            opts = this.inheritOptions(opts, inheritFrom);
        }

        // Inherit options based on responsive media queries
        if (opts.responsive && window.matchMedia) {
            $.each(opts.responsive, function(key, resOpts) {
                if (matchMedia(resOpts.breakpoint).matches) {
                    $.extend(opts, resOpts);
                    return false;
                }
            });
        }

        // Convert hover to mouseenter
        if (opts.mode && opts.mode === 'hover') {

            // Reset for touch devices
            if (Toolkit.isTouch) {
                opts.mode = 'click';
            } else {
                opts.mode = 'mouseenter';
            }
        }

        return opts;
    },

    /**
     * Return the component name hyphenated for use in CSS classes.
     * Cache the result to reduce processing time.
     *
     * @private
     * @returns {string}
     */
    _cssClass: function() {
        if (this.cssClass) {
            return this.cssClass;
        }

        return this.cssClass = this.component.replace(/[A-Z]/g, function(match) {
            return ('-' + match.charAt(0).toLowerCase());
        }).slice(1);
    },

    /**
     * Return the component name with the 1st character lowercase for use in events and attributes.
     * Cache the result to reduce processing time.
     *
     * @private
     * @returns {string}
     */
    _keyName: function() {
        if (this.keyName) {
            return this.keyName;
        }

        var name = this.component;

        return this.keyName = name.charAt(0).toLowerCase() + name.slice(1);
    }

}, {
    cache: true,
    context: null,
    className: '',
    template: '',
    templateFrom: ''
});

return Toolkit;
});