'use strict';

var LayoutBase = {
    //---------------------------------------------------------
    // Abstract: MUST OVERRIDE!
    //---------------------------------------------------------
    getSizeValue: function(/*component, itemIndex*/) {
        throw Error('not implemented');
    },
    getStyles: function() {
        throw Error('not implemented');
    },
    getTouchPositionValue: function(/*touch*/) {
        throw Error('not implemented');
    },
    getTranslation: function(/*component*/) {
        throw Error('not implemented');
    },
    getViewportSize: function(/*component*/) {
        throw Error('not implemented');
    },
    getWheelEventDelta: function(/*evt*/) {
        throw Error('not implemented');
    },
    //---------------------------------------------------------
    // Concrete
    //---------------------------------------------------------
    constrainScrollPosition: function(component, scrollPosition) {
        var itemSizes = component.state.itemSizes;
        var totalSize = 0;
        for (var i = 0, n = itemSizes.length; i < n; i++) {
            var itemSizeValue = this.getSizeValue(component, i);
            totalSize += itemSizeValue;
        }
        var viewportSize = this.getViewportSize(component);
        var maxPosition = totalSize - viewportSize;
        return Math.max(0, Math.min(maxPosition, scrollPosition));
    },
    getRangeToRender: function(component, scrollPosition) {
        var itemSizes = component.state.itemSizes;
        var numberOfItems = itemSizes.length;
        var cumulativePosition = 0;
        var i = 0;
        var itemSizeValue;
        var itemsToOverflow = component.props.itemsToOverflow;
        // Calc the top and bottom of the list visible in the viewport.
        var viewportBounds = this.getViewportBounds(component, scrollPosition);
        // Calculate the new start index.
        for (; i < numberOfItems; i++) {
            itemSizeValue = this.getSizeValue(component, i);
            if (cumulativePosition + itemSizeValue >= viewportBounds.min) {
                break;
            }
            cumulativePosition += itemSizeValue;
        }
        var startIndex = Math.max(0, i - itemsToOverflow);
        // Calculate the new end index.
        for (; i < numberOfItems; i++) {
            itemSizeValue = this.getSizeValue(component, i);
            if (cumulativePosition + itemSizeValue >= viewportBounds.max) {
                break;
            }
            cumulativePosition += itemSizeValue;
        }
        var endIndex = Math.min(numberOfItems - 1, i + itemsToOverflow);
        // Done
        return {
            startIndex: startIndex,
            endIndex: endIndex
        };
    },
    getScrollOffset: function(component, startIndex) {
        var scrollOffset = 0;
        for (var i = 0; i < startIndex; i++) {
            scrollOffset += this.getSizeValue(component, i);
        }
        return scrollOffset;
    },
    getTouchPosition: function(evt) {
        var touches = evt.touches;
        var sumPosition = 0;
        for (var i = 0, n = touches.length; i < n; i++) {
            var touch = touches[i];
            sumPosition += this.getTouchPositionValue(touch);
        }
        return sumPosition / n;
    },
    getTranslationValue: function(component) {
        return -component.state.scrollPosition + component.state.scrollOffset;
    },
    getViewportBounds: function(component, scrollPosition) {
        var min = scrollPosition || component.state.scrollPosition;
        var size = this.getViewportSize(component);
        var max = min + size;
        return {
            min: min,
            max: max
        };
    }
};
module.exports = LayoutBase;
