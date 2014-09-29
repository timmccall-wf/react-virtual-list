'use strict';

var _ = require('lodash');
var EasingFunctions = require('./easing-functions');
var React = require('react');
var TouchSession = require('./touch-session');
var tween = require('./tween');

var VirtualList = React.createClass({
    setScrollPosition: function(position) {
        var layout = this.props.layout;
        var validatedPosition = layout.constrainScrollPosition(
            this.state.itemSizes, position, this.getDOMNode()
        );
        this.setState({ scrollPosition: validatedPosition });
    },
    getDefaultProps: function() {
        return {
            // Optional:
            className: null,
            itemsToOverflow: 5,
            swipeEasing: EasingFunctions.easeOutCubic,
            touchSessionFactory: TouchSession.create,
            // Required:
            initialItemSizes: [],
            layout: null,
            itemRenderer: null,
        };
    },
    getInitialState: function() {
        return {
            itemSizes: this.props.initialItemSizes,
            scrollPosition: 0,
            useWheelHitArea: false
        };
    },
    componentDidMount: function() {
        // No items are rendered during initial mounting since this component
        // need to know about the viewport DOM node to calculate the range of
        // items to render. Set the scroll position to trigger a rerendering.
        this.setScrollPosition(0);
    },
    render: function() {
        var layout = this.props.layout;
        var styles = layout.getStyles();
        var itemSizes = this.state.itemSizes;
        // Create list items to render. On first pass render no items, since
        // the start and end indexes of the range to render are dependent on the
        // size of the viewport, which doesn't exist until after the component
        // is mounted.
        var items = [];
        var scrollPosition;
        var rangeToRender;
        if (this.isMounted()) {
            scrollPosition = this.state.scrollPosition;
            var viewportElement = this.getDOMNode();
            var viewportSize = layout.getViewportSize(viewportElement);
            var viewportBounds = layout.getViewportBounds(scrollPosition, viewportSize);
            rangeToRender = layout.getRangeToRender(
                itemSizes, viewportBounds, this.props.itemsToOverflow
            );
            for (var i = rangeToRender.startIndex; i <= rangeToRender.endIndex; i++) {
                var item = this.props.itemRenderer({ key: i });
                items.push(item);
            }
        }
        // Create a list container to translate the list content. Again, wait
        // until the component before attempting to calculate the translation
        // base on current scroll position, since this calculation depends
        // on getting the range to render.
        var translationValue = 0;
        if (this.isMounted()) {
            var scrollOffset = layout.getScrollOffset(itemSizes, rangeToRender.startIndex);
            translationValue = -scrollPosition + scrollOffset;
        }
        var transform = layout.getTranslation(translationValue);
        var listContainer = React.DOM.div({
            className: 'rvl-item-container',
            style: _.assign({}, styles.listContainer, {
                '-webkit-transform': transform
            }),
        }, items);
        // Wheel hit area is needed to prevent sudden stop of hardware generated
        // wheel events when simulating a swipe. This is common with trackpads
        // and magic mice, et al. Once real wheel events cease, the hardware
        // generated events target the target element of the last real wheel.
        // However, in the case of a virtualized list, that element might be
        // removed from the DOM while the simulated swipe is still generating
        // wheel events, causing these events to suddenly stop. By putting up
        // this hit area on the first real wheel event, we ensure that the
        // generated wheels still target a live DOM element. Shortly after the
        // last wheel event is detected, this layer is removed.
        var wheelHitArea;
        if (this.state.useWheelHitArea) {
            wheelHitArea = React.DOM.div({
                className: 'rvl-wheel-hit-area',
                style: _.assign({
                    position: 'absolute',
                    zIndex: 1000,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                })
            });
        }
        // Viewport hosts the list content and provides a clipping region.
        var viewport = React.DOM.div({
            className: [this.props.className, 'rvl-viewport'].join(' '),
            style: _.assign({}, styles.viewport, {
                position: 'relative'
            }),
            onTouchStart: this.handleTouchStart,
            onTouchMove: this.handleTouchMove,
            onTouchEnd: this.handleTouchEnd,
            onWheel: this.handleWheel
        }, listContainer, wheelHitArea);
        return viewport;
    },
    handleTouchStart: function(evt) {
        // If tweening a change in position, stop!
        if (this._tweener) {
            this._tweener.cancel();
            this._tweener = null;
        }
        var layout = this.props.layout;
        var touchPosition = layout.getTouchPosition(evt);
        var touchSession = this.props.touchSessionFactory();
        touchSession.recordTouch(touchPosition);
        this._touchSession = touchSession;
        // Prevent window movement from default window touch start handling.
        evt.preventDefault();
    },
    handleTouchMove: function(evt) {
        var layout = this.props.layout;
        var touchPosition = layout.getTouchPosition(evt);
        this._touchSession.recordTouch(touchPosition);
        var touchDelta = this._touchSession.getLastTouchDelta();
        this.updateScrollPosition(touchDelta);
        // Prevent window movement from default window touch move handling.
        evt.preventDefault();
    },
    handleTouchEnd: function(evt) {
        this._touchSession.detectGestures({
            onTap: this.handleTouchTap,
            onHold: this.handleTouchHold,
            onSwipe: this.handleTouchSwipe
        });
        this._touchSession = null;
        // Be consistent with other touch handlers.
        evt.preventDefault();
    },
    handleTouchTap: function() {
        // console.log('detected tap');
    },
    handleTouchHold: function() {
        // console.log('detected hold');
    },
    handleTouchSwipe: function(velocity) {
        var duration = 1250;
        var startPosition = this.state.scrollPosition;
        var endPosition = startPosition + (velocity * duration);
        this._tweener = tween(startPosition, endPosition, duration, this.props.swipeEasing, {
            tick: function(currentPosition) {
                this.setScrollPosition(currentPosition);
            }.bind(this)
        });
    },
    handleWheel: function(evt) {
        var layout = this.props.layout;
        var wheelDelta = layout.getWheelEventDelta(evt);
        var newScrollPosition = this.state.scrollPosition + wheelDelta;
        this.setScrollPosition(newScrollPosition);
        // Enable the wheel hit area and set a timer to remove it shortly after
        // the last wheel event occurs.
        this.setState({ useWheelHitArea: true });
        if (!this._debouncedRemoveWheelHitArea) {
            this._debouncedRemoveWheelHitArea = _.debounce(function() {
                this.setState({ useWheelHitArea: false });
            }.bind(this), 50);
        }
        this._debouncedRemoveWheelHitArea();
        // Prevent window bounce when wheel has no effect and bubbles out.
        evt.preventDefault();
    }
});
module.exports = VirtualList;
