window.logger = {

    INFO: {
        "foreground": "#008f16FF",
        "background": "#00000000"
    },
    WARNING: {
        "foreground": "#ff8200FF",
        "background": "#00000000"
    },
    ERROR: {
        "foreground": "#ff5a00FF",
        "background": "#00000000"
    },
    DEBUG: {
        "foreground": "#005491",
        "background": "#00000000"
    },

    info: function (msg) {
        if (typeof msg === "object") {
            console.log(msg);
        } else {
            console.log("%c" + msg, "color: " + this.INFO.foreground + "; background: " + this.INFO.background);
        }
    },

    warning: function (msg) {
        if (typeof msg === "object") {
            console.warn(msg);
        } else {
            console.warn("%c" + msg, "color: " + this.WARNING.foreground + "; background: " + this.WARNING.background);
        }
    },

    error: function (msg) {

        if (typeof msg === "object") {
            console.error(msg);
        } else {
            console.error("%c" + msg, "color: " + this.ERROR.foreground + "; background: " + this.ERROR.background);
        }
    },

    debug: function (msg) {
        if (window._smartblocks === "undefined" || window._smartblocks.debug === false) return;

        if (typeof msg === "object") {
            console.debug(msg);
        } else {
            console.debug("%c" + msg, "color: " + this.DEBUG.foreground + "; background: " + this.DEBUG.background);
        }
    }
};