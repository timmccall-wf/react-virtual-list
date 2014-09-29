'use strict';

var _ = require('lodash');

var SWIPE_VELOCITY_THRESHOLD = 0.5;
var TAP_TIME_THRESHOLD = 250;
var NOOP = function() {};

var TouchSession = function(options) {
    this._settings = _.defaults(options || {
        swipeVelocityThreshold: SWIPE_VELOCITY_THRESHOLD,
        tapTimeThreshold: TAP_TIME_THRESHOLD
    });
    this._startTouchPosition = null;
    this._startTouchTime = null;
    this._lastTouchPosition = null;
    this._lastTouchPositionDelta = 0;
    this._lastTouchTime = null;
    this._lastTouchTimeDelta = 0;
};
_.assign(TouchSession.prototype, {
    getLastTouchDelta: function() {
        return this._lastTouchPositionDelta;
    },
    recordTouch: function(touchPosition) {
        var now = Date.now();
        if (this._lastTouchPosition) {
            this._lastTouchPositionDelta = -(touchPosition - this._lastTouchPosition);
            this._lastTouchTimeDelta = now - this._lastTouchTime;
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
        var velocity = this._lastTouchPositionDelta / this._lastTouchTimeDelta;
        if (Math.abs(velocity) > this._settings.swipeVelocityThreshold) {
            return velocity;
        }
        return false;
    }
});
TouchSession.start = function() {
    return new TouchSession();
};
module.exports = TouchSession;
