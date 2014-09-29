'use strict';

var _ = require('lodash');

var NOOP = function() {};

var Tween = function(start, end, duration, easing, callbacks) {
    callbacks = _.defaults(callbacks || {}, {
        tick: NOOP,
        done: NOOP
    });

    var currentValue = start;
    var delta = end - start;
    var startTime;
    var cancelled;

    function tick(timestamp) {
        if (cancelled) {
            return callbacks.done(currentValue);
        }
        // Find the elapsed time so we can ease. Use the timestamp provided by
        // browser impl of requestAnimationFrame if available, otherwise use
        // Date obj to compare.
        var now = Date.now();
        if (!startTime) {
            startTime = timestamp || now;
        }
        var elapsed = (timestamp || now) - startTime;
        // Are we done? If not, tick and setup next.
        if (elapsed < duration) {
            currentValue = easing(null, elapsed, start, delta, duration);
            callbacks.tick(currentValue);
            requestAnimationFrame(tick);
        } else {
            callbacks.tick(end);
            callbacks.done(end);
        }
    }

    requestAnimationFrame(tick);

    return {
        cancel: function() {
            cancelled = true;
        }
    };
};
module.exports = Tween;
