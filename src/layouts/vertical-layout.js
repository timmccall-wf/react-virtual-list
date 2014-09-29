'use strict';

var _ = require('lodash');
var LayoutBase = require('./layout-base');

var VerticalLayout = _.assign({}, LayoutBase, {
    getSizeValue: function(component, itemIndex) {
        var itemSizes = component.state.itemSizes;
        var value = itemSizes[itemIndex].height;
        return value;
    },
    getStyles: function() {
        return {
            viewport: {
                overflow: 'hidden'
            },
            listContainer: {
            }
        };
    },
    getTouchPositionValue: function(touch) {
        return touch.pageY;
    },
    getTranslation: function(component) {
        var value = this.getTranslationValue(component);
        return 'translate3d(0, ' + value + 'px, 0)';
    },
    getViewportSize: function(component) {
        var element = component.getDOMNode();
        var size = element.clientHeight;
        return size;
    },
    getWheelEventDelta: function(evt) {
        return evt.deltaY;
    }
});
module.exports = VerticalLayout;
