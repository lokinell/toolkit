define([
    './component'
], function(Toolkit) {

Toolkit.Blackout = Toolkit.Component.extend(function(options) {
    this.component = 'Blackout';
    this.version = '1.4.0';
    this.options = options = this.setOptions(options);
    this.element = this.createElement();

    // How many times the blackout has been opened while being opened
    this.count = 0;

    // Build the loader
    var count = (options.loader === 'bubble-spinner') ? 8 : options.waveCount,
        loader = $('<div/>')
            .addClass(Toolkit.vendor + 'loader')
            .addClass(options.loader)
            .appendTo(this.element);

    var spans = '', i;

    for (i = 0; i < count; i++) {
        spans += '<span></span>';
    }

    if (options.loader === 'bubble-spinner') {
        $('<div/>')
            .addClass(Toolkit.vendor + 'loader-spinner')
            .html(spans)
            .appendTo(loader);
    } else {
        loader.html(spans);
    }

    this.loader = loader;

    // Build the message
    this.message = $('<div/>')
        .addClass(Toolkit.vendor + 'loader-message')
        .html(Toolkit.messages.loading)
        .appendTo(loader);

    this.initialize();
}, {

    /**
     * Hide the blackout if count reaches 0.
     */
    hide: function() {
        var count = this.count - 1;

        if (count <= 0) {
            this.count = 0;
            this.element.conceal();
            this.hideLoader();
        } else {
            this.count = count;
        }

        this.fireEvent('hide', (count <= 0));
    },

    /**
     * Hide the loader.
     */
    hideLoader: function() {
        this.loader.conceal();
        this.fireEvent('hideLoader');
    },

    /**
     * Show the blackout and increase open count.
     */
    show: function() {
        var show = false;

        this.count++;

        if (this.count === 1) {
            this.element.reveal();
            show = true;
        }

        this.showLoader();
        this.fireEvent('show', show);
    },

    /**
     * Show the loader.
     */
    showLoader: function() {
        this.loader.reveal();
        this.fireEvent('showLoader');
    }

}, {
    loader: 'bar-wave',
    waveCount: 5,
    template: '<div class="' + Toolkit.vendor + 'blackout"></div>',
    templateFrom: '#toolkit-blackout-1'
});

/** Has the blackout been created already? */
var blackout = null;

/**
 * Only one instance of Blackout should exist,
 * so provide a factory method that stores the instance.
 *
 * @param {Object} [options]
 * @returns {Toolkit.Blackout}
 */
Toolkit.Blackout.instance = function(options) {
    if (blackout) {
        return blackout;
    }

    return blackout = new Toolkit.Blackout(options);
};

return Toolkit;
});