/**
A way to embed a neo console in a web page for demos purposes
@credits Based on early work by rabbithole - http://neo4j.com/blog/rabbithole-the-neo4j-repl-console/
*/
require.register('NeoConsoleReact', function (require, exports, module) {

	'use strict';

	var React = window.React;

	var Class = React.createClass({
		componentDidMount: function() {
			var props = this.props;
			var xConsole = this.refs.iframe.getDOMNode();
		    xConsole.addEventListener('load', function() {
		    	props.onLoad();
		    });
			xConsole.src = this.getConsoleUrl(props.consoleUrl, 'none', 'none', '\n\nUse the play/edit buttons to run the queries!');

			window.addEventListener('message', function(event) {
				var result = JSON.parse(event.data);
				props.onData(result);
			}, false);

		},
		render: function() {
			return React.createElement(
				'neo4j-console', null, 
				React.createElement('iframe', 
					{ref: 'iframe', 
					 className: 'cypherdoc-console', 
					 height: 400, 
					 width: 600, 
					}, 'hello')
			);
		},
		shouldComponentUpdate: function(newprops) {
			if(newprops.callId === this.props.callId) { return false; }
			if(newprops.queries === undefined) { return false; }
			var xConsole = this.refs.iframe.getDOMNode();
			xConsole.contentWindow.postMessage(JSON.stringify({
	            'action': 'query',
	            'data': newprops.queries,
	            'call_id': newprops.callId
	        }), '*');

			return false;
		},
	getConsoleUrl: function(consoleUrl, database, command, message, session, neo4jVersion) {
		/*
		Something of the like
		http://neo4j-console-22.herokuapp.com/?init=none&query=none&message=%0A%0AUse%20the%20play%2Fedit%20buttons%20to%20run%20the%20queries!&no_root=true
		*/
		var url = consoleUrl;
        if (session !== undefined) {
            url += ';jsessionid=' + session;
        }
        url += '?';
        if (database !== undefined) {
            url += 'init=' + encodeURIComponent(database);
        }
        if (command !== undefined) {
            url += '&query=' + encodeURIComponent(command);
        }
        if (message !== undefined) {
            url += '&message=' + encodeURIComponent(message);
        }
        if (neo4jVersion !== undefined) {
            url += '&version=' + encodeURIComponent(neo4jVersion);
        }
        return url + '&no_root=true';
	    }		
	});

	
	module.exports = Class;
});
