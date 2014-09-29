'use strict';

var HorizontalLayout = require('../../src/layouts/horizontal-layout');
var ListItem = require('./list-item');
var React = require('react');
var VerticalLayout = require('../../src/layouts/vertical-layout');
var VirtualList = require('../../src/virtual-list');

var itemSizes = [];
for (var i = 0; i < 1000; i++) {
    itemSizes.push({ width: 150, height: 100 });
}

React.initializeTouchEvents(true);

var horizontalList = React.renderComponent(
    VirtualList({
        initialItemSizes: itemSizes,
        layout: HorizontalLayout,
        renderer: ListItem
    }),
    document.getElementById('container-horizontal')
);

var verticalList = React.renderComponent(
    VirtualList({
        initialItemSizes: itemSizes,
        layout: VerticalLayout,
        renderer: ListItem
    }),
    document.getElementById('container-vertical')
);

window.demo = {
    horizontalList: horizontalList,
    verticalList: verticalList
};
