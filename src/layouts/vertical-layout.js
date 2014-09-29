'use strict';

var _ = require('lodash');
var LayoutBase = require('./layout-base');

var VerticalLayout = _.assign({}, LayoutBase, {
    getSizeValue: function(itemSize) {
        return itemSize.height;
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
    getTranslation: function(translateValue) {
        return 'translate3d(0, ' + translateValue + 'px, 0)';
    },
    getViewportSize: function(viewportElement) {
        return viewportElement.clientHeight;
    },
    getWheelEventDelta: function(evt) {
        return evt.deltaY;
    }
});
module.exports = VerticalLayout;
