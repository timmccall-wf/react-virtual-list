'use strict';

var LayoutBase = {
    //---------------------------------------------------------
    // Abstract: MUST OVERRIDE!
    //---------------------------------------------------------
    getSizeValue: function(/*itemSize*/) {
        throw Error('not implemented');
    },
    getStyles: function() {
        throw Error('not implemented');
    },
    getTouchPositionValue: function(/*touch*/) {
        throw Error('not implemented');
    },
    getTranslation: function(/*translateValue*/) {
        throw Error('not implemented');
    },
    getViewportSize: function(/*viewportElement*/) {
        throw Error('not implemented');
    },
    getWheelEventDelta: function(/*evt*/) {
        throw Error('not implemented');
    },
    //---------------------------------------------------------
    // Concrete
    //---------------------------------------------------------
    constrainScrollPosition: function(itemSizes, scrollPosition, viewportElement) {
        var totalSize = 0;
        for (var i = 0, n = itemSizes.length; i < n; i++) {
            var itemSize = itemSizes[i];
            var itemSizeValue = this.getSizeValue(itemSize);
            totalSize += itemSizeValue;
        }
        var viewportSize = this.getViewportSize(viewportElement);
        var maxPosition = totalSize - viewportSize;
        return Math.max(0, Math.min(maxPosition, scrollPosition));
    },
    getRangeToRender: function(itemSizes, viewportBounds, itemsToOverflow) {
        var numberOfItems = itemSizes.length;
        var cumulativePosition = 0;
        var i = 0;
        var itemSize;
        var itemSizeValue;
        // Calculate the new start index.
        for (; i < numberOfItems; i++) {
            itemSize = itemSizes[i];
            itemSizeValue = this.getSizeValue(itemSize);
            if (cumulativePosition + itemSizeValue >= viewportBounds.min) {
                break;
            }
            cumulativePosition += itemSizeValue;
        }
        var startIndex = Math.max(0, i - itemsToOverflow);
        // Calculate the new end index.
        for (; i < numberOfItems; i++) {
            itemSize = itemSizes[i];
            itemSizeValue = this.getSizeValue(itemSize);
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
    getScrollOffset: function(itemSizes, startIndex) {
        var scrollOffset = 0;
        for (var i = 0; i < startIndex; i++) {
            var itemSize = itemSizes[i];
            scrollOffset += this.getSizeValue(itemSize);
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
    getViewportBounds: function(scrollPosition, viewportSize) {
        return {
            min: scrollPosition,
            max: scrollPosition + viewportSize
        };
    }
};
module.exports = LayoutBase;
