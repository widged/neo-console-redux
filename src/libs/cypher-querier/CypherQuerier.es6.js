/* jshint esnext: true */

export default class CypherQuerier {
	constructor() {
		this.state = {consoleFrame: undefined};
	}

	consoleFrame(_) {
		if(!arguments.length) { return this.state.consoleFrame; }
		this.state.consoleFrame = _;
		return this;
	}

	post(data, isConsoleUpdated) { 
		const {consoleFrame} = this.state;
		if(!Array.isArray(data)) { data = [data]; }

		var then = function(thenFn) {
			function onMessage(event) { 
				var result = JSON.parse(event.data); 
				whenDone(result);
			}
			function whenDone(data) {
				thenFn(null, data); 
				window.removeEventListener('message', onMessage);
			}
			window.addEventListener('message', onMessage, false);
			consoleFrame.contentWindow.postMessage(JSON.stringify({ 'action': 'query', 'data': data, 'call_id': (isConsoleUpdated) ? 0 : 1  }), '*');
			if(isConsoleUpdated) { whenDone(); }
		};
		
		return {then};
	}

	static getConsoleUrl(consoleUrl, database, command, message, session, neo4jVersion) {
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
}