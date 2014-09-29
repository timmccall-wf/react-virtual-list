'use strict';

var _ = require('lodash');

var SWIPE_VELOCITY_THRESHOLD = 0.7;
var TAP_TIME_THRESHOLD = 250;
var NOOP = function() {};

var TouchSession = function(options) {
    //---------------------------------------------------------
    // Private state
    //---------------------------------------------------------
    this._settings = _.defaults(options || {
        swipeVelocityThreshold: SWIPE_VELOCITY_THRESHOLD,
        tapTimeThreshold: TAP_TIME_THRESHOLD
    });
    this._startTouchPosition = null;
    this._startTouchTime = null;
    this._lastTouchPosition = null;
    this._lastTouchTime = null;
    this._lastTouchDeltaPosition = 0;
    this._lastTouchDeltaTime = 0;
};
_.assign(TouchSession.prototype, {
    //---------------------------------------------------------
    // Public
    //---------------------------------------------------------
    getLastTouchDelta: function() {
        return this._lastTouchDeltaPosition;
    },
    recordTouch: function(touchPosition) {
        var now = Date.now();
        if (this._lastTouchPosition) {
            this._lastTouchDeltaPosition = -(touchPosition - this._lastTouchPosition);
            this._lastTouchDeltaTime = now - this._lastTouchTime;
        } else {
            this._startTouchPosition = touchPosition;
            this._startTouchTime = now;
        }
        this._lastTouchPosition = touchPosition;
        this._lastTouchTime = now;
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
        var velocity = this._detectSwipe();
        if (velocity) {
            return handlers.onSwipe(velocity);
        }
    },
    //---------------------------------------------------------
    // Private
    //---------------------------------------------------------
    _detectTap: function() {
        var deltaPosition = this._lastTouchPosition - this._startTouchPosition;
        if (deltaPosition === 0) {
            var deltaTime = Date.now() - this._startTouchTime;
            return (deltaTime < this._settings.tapTimeThreshold);
        }
        return false;
    },
    _detectHold: function() {
        var deltaPosition = this._lastTouchPosition = this._startTouchPosition;
        if (deltaPosition === 0) {
            var deltaTime = Date.now() - this._startTouchTime;
            return (deltaTime >= this._settings.tapTimeThreshold);
        }
        return false;
    },
    _detectSwipe: function() {
        var velocity = this._lastTouchDeltaPosition / this._lastTouchDeltaTime;
        if (Math.abs(velocity) > this._settings.swipeVelocityThreshold) {
            return velocity;
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
