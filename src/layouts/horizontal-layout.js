'use strict';

var _ = require('lodash');
var LayoutBase = require('./layout-base');

var HorizontalLayout = _.assign({}, LayoutBase, {
    getSizeValue: function(itemSize) {
        return itemSize.width;
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
    getTranslation: function(translateValue) {
        return 'translate3d(' + translateValue + 'px, 0, 0)';
    },
    getViewportSize: function(viewportElement) {
        return viewportElement.clientWidth;
    },
    getWheelEventDelta: function(evt) {
        return evt.deltaX;
    }
});
module.exports = HorizontalLayout;
