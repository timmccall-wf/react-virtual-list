React Virtual List
===

> Virtual list implementation using React

Usage
---

You must provide three things, at minimum:
- a layout;
- the sizes of the items, either width or height, depending on the layout;
- a React component to render the list items.

```javascript
var React = require('react');
var VerticalLayout = require('react-virtual-list/layouts/vertical-layout');
var VirtualList = require('react-virtual-list/virtual-list');

React.initializeTouchEvents(true);

// 1000 items
var itemSizes = [];
for (var i = 0; i < 1000; i++) {
    itemSizes.push({ height: 100 });
}

// Dead simple list item renderer
var ListItem = React.createClass({
    render: function() {
        return (
            React.DOM.div({
                key: this.props.key,
            }, this.props.key)
        );
    }
});

// Virtual list with vertical layout
var verticalList = React.renderComponent(
    VirtualList({
        initialItemSizes: itemSizes,
        layout: VerticalLayout,
        itemRenderer: ListItem
    }),
    document.getElementById('container')
);
```
