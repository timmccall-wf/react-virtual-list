'use strict';

var _ = require('lodash');

var SWIPE_VELOCITY_THRESHOLD = 0.7;
var TAP_THRESHOLD = 250;
var VELOCITY_DETECTION_RANGE = 50;
var NOOP = function() {};

var TouchSession = function(options) {
    //---------------------------------------------------------
    // Private state
    //---------------------------------------------------------
    this._settings = _.defaults(options || {
        swipeVelocity: SWIPE_VELOCITY_THRESHOLD,
        tapThreshold: TAP_THRESHOLD,
        velocityDetectionRange: VELOCITY_DETECTION_RANGE
    });
    this._prevTouchPosition = null;
    this._touchHistory = [];
};
_.assign(TouchSession.prototype, {
    //---------------------------------------------------------
    // Public
    //---------------------------------------------------------
    getLastTouchDelta: function() {
        var lastTouch = this._getTouchRecord(-1);
        var penultimateTouch = this._getTouchRecord(-2);
        if (lastTouch && penultimateTouch) {
            return -(lastTouch.position - penultimateTouch.position);
        }
        return 0;
    },
    recordTouch: function(touchPosition) {
        this._touchHistory.push({
            position: touchPosition,
            time: Date.now()
        });
    },
    detectGestures: function(handlers) {
        handlers = _.defaults(handlers, {
            onTap: NOOP,
            onHold: NOOP,
            onSwipe: NOOP,
        });
        if (this._detectTap()) {
            return handlers.onTap();
        }
        if (this._detectHold()) {
            return handlers.onHold();
        }
        if (this._detectSwipe()) {
            return handlers.onSwipe();
        }
    },
    //---------------------------------------------------------
    // Private
    //---------------------------------------------------------
    _getTouchRecord: function(index) {
        var history = this._touchHistory;
        if (index < 0) {
            index = history.length + index;
        }
        return history[index];
    },
    _detectTap: function() {
        var touchStart = this._touchHistory[0];
        var touchEnd = this._getTouchRecord(-1);
        var deltaPosition = touchEnd.position - touchStart.position;
        if (deltaPosition === 0) {
            var deltaTime = Date.now() - touchStart.time;
            return (deltaTime < this._settings.tapThreshold);
        }
        return false;
    },
    _detectHold: function() {
        var touchStart = this._touchHistory[0];
        var touchEnd = this._getTouchRecord(-1);
        var deltaPosition = touchEnd.position - touchStart.position;
        if (deltaPosition === 0) {
            var deltaTime = Date.now() - touchStart.time;
            return (deltaTime >= this._settings.tapThreshold);
        }
        return false;
    },
    _detectSwipe: function() {
        // Test the "instantaneous" velocity to detect a swipe event
        // by reading through the recent range of touch events.
        var velocityDetectionRange = this._settings.velocityDetectionRange;
        var history = this._touchHistory;
        var touchStart = history[0];
        if (Date.now() - touchStart.time >= velocityDetectionRange) {
            var touchEnd = this._getTouchRecord(-1);
            var touchToCompare;
            for (var i = history.length - 2; i >= 0; i--) {
                touchToCompare = history[i];
                if (touchEnd.time - touchToCompare.time >= velocityDetectionRange) {
                    break;
                }
            }
            var deltaPosition = touchEnd.position - touchToCompare.position;
            var deltaTime = touchEnd.time - touchToCompare.time;
            if (Math.abs(deltaPosition) / deltaTime > this._settings.swipeVelocity) {
                return true;
            }
        }
        return false;
    }
});
//---------------------------------------------------------
// Static
//---------------------------------------------------------
TouchSession.start = function() {
    return new TouchSession();
};
module.exports = TouchSession;
