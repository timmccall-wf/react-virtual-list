'use strict';

var React = require('react');

function getBackgroundColor(n) {
    // cf: http://indiegamr.com/generate-repeatable-random-numbers-in-js/
    function nextChannel() {
        n = (n * 9301 + 49297) % 233280;
        var next = Math.floor(n / 233280 * 256);
        return next;
    }
    var r = nextChannel();
    var g = nextChannel();
    var b = nextChannel();
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}

var ListItem = React.createClass({
    componentDidMount: function() {
        // console.log('mounted', this.props.key);
    },
    componentWillUnmount: function() {
        // console.log('unmounted', this.props.key);
    },
    render: function() {
        return (
            React.DOM.div({
                className: 'list-item',
                key: this.props.key,
                style: {
                    backgroundColor: getBackgroundColor(this.props.key)
                }
            }, React.DOM.span({}, this.props.key))
        );
    }
});
module.exports = ListItem;
