'use strict';

var _ = require('lodash');
var LayoutBase = require('./layout-base');

var HorizontalLayout = _.assign({}, LayoutBase, {
    getSizeValue: function(component, itemIndex) {
        var itemSizes = component.state.itemSizes;
        var value = itemSizes[itemIndex].width;
        return value;
    },
    getStyles: function() {
        return {
            viewport: {
                overflow: 'hidden'
            },
            listContainer: {
                height: '100%',
                whiteSpace: 'nowrap'
            }
        };
    },
    getTouchPositionValue: function(touch) {
        return touch.pageX;
    },
    getTranslation: function(component) {
        var value = this.getTranslationValue(component);
        return 'translate3d(' + value + 'px, 0, 0)';
    },
    getViewportSize: function(component) {
        var element = component.getDOMNode();
        var size = element.clientWidth;
        return size;
    },
    getWheelEventDelta: function(evt) {
        return evt.deltaX;
    }
});
module.exports = HorizontalLayout;
