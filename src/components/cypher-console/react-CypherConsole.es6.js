/* jshint esnext: true */

import React             from 'react';
import ReactDOM          from 'react-dom';

let {Component} = React;

export default class CypherConsole extends Component {
	componentDidMount() {
		var {onLoaded} = this.props;
		if(typeof onLoaded === 'function') {
			onLoaded(this.refs.iframe);
		}
	}

	render() {
		const {consoleUrl} = this.props;
		return (
			<wg-neo4j-console>
				<iframe ref="iframe" className="cypherdoc-console" src={consoleUrl} width="600" height="400" >
				iframe must be enabled.
				</iframe>
			</wg-neo4j-console>
		);
	}
}