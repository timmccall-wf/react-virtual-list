'use strict';

var _ = require('lodash');
var React = require('react');
var TouchSession = require('./touch-session');

var VirtualList = React.createClass({
    //---------------------------------------------------------
    // Public
    //---------------------------------------------------------

    //---------------------------------------------------------
    // Internal
    //---------------------------------------------------------
    getDefaultProps: function() {
        return {
            // Optional:
            className: 'virtual-list',
            itemsToOverflow: 5,
            touchSessionFactory: TouchSession.start,
            // Required:
            initialItemSizes: [],
            layout: null,
            renderer: null,
        };
    },
    getInitialState: function() {
        return {
            itemSizes: this.props.initialItemSizes,
            scrollOffset: 0,
            scrollPosition: 0,
            startIndex: 0,
            endIndex: -1,
            useWheelHitArea: false
        };
    },
    componentDidMount: function() {
        // Calculate the initial endIndex based on the props.
        var layout = this.props.layout;
        var rangeToRender = layout.getRangeToRender(this);
        this.setState(rangeToRender);
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        return (
            this.state.useWheelHitArea !== nextState.useWheelHitArea ||
            this.state.scrollPosition != nextState.scrollPosition ||
            this.state.startIndex !== nextState.startIndex ||
            this.state.endIndex !== nextState.endIndex
        );
    },
    render: function() {
        // List items to render.
        var items = [];
        for (var i = this.state.startIndex; i <= this.state.endIndex; i++) {
            var item = this.props.renderer({ key: i });
            items.push(item);
        }
        var layout = this.props.layout;
        var styles = layout.getStyles();
        // List container is needed for horizontal scrolling.
        var listContainer = React.DOM.div({
            className: 'item-container',
            style: _.assign({}, styles.listContainer, {
                '-webkit-transform': layout.getTranslation(this)
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
                className: 'wheel-hit-area',
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
        // Viewport hosts the list content and proves a clipping region.
        var viewport = React.DOM.div({
            className: this.props.className,
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
        var layout = this.props.layout;
        var touchPosition = layout.getTouchPosition(evt);
        var touchSession = this.props.touchSessionFactory();
        touchSession.recordTouch(touchPosition);
        this._touchSession = touchSession;
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
    handleTouchEnd: function() {
        this._touchSession.detectGestures({
            onTap: function() { console.log('detected tap'); },
            onHold: function() { console.log('detected hold'); },
            onSwipe: function() { console.log('detected swipe'); }
        });
        this._touchSession = null;
    },
    handleWheel: function(evt) {
        var layout = this.props.layout;
        var wheelDelta = layout.getWheelEventDelta(evt);
        this.updateScrollPosition(wheelDelta, { useWheelHitArea: true });
        // Prevent window bounce when wheel has no effect and bubbles out.
        evt.preventDefault();
        // Remove the wheel hit area shortly after the last wheel event.
        if (!this._debouncedRemoveWheelHitArea) {
            this._debouncedRemoveWheelHitArea = _.debounce(this.removeWheelHitArea, 50);
        }
        this._debouncedRemoveWheelHitArea();
    },
    updateScrollPosition: function(delta, additionalState) {
        var layout = this.props.layout;
        var rangeToRender = layout.getRangeToRender(this);
        var newScrollPosition = this.state.scrollPosition + delta;
        var nextScrollPosition = layout.constrainScrollPosition(this, newScrollPosition);
        var nextScrollOffset = layout.getScrollOffset(this, rangeToRender.startIndex);
        var nextState = _.assign({
            scrollPosition: nextScrollPosition,
            scrollOffset: nextScrollOffset,
            startIndex: rangeToRender.startIndex,
            endIndex: rangeToRender.endIndex
        }, additionalState);
        this.setState(nextState);
    },
    removeWheelHitArea: function() {
        this.setState({
            useWheelHitArea: false
        });
    }
});
module.exports = VirtualList;
