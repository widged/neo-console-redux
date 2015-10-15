/* jshint esnext: true */

export default class AsyncPipe {
	constructor(listFn) {
		this.state = {listFn: listFn};
	}

    then(lastFn) {
    	let {listFn} = this.state;
    	let currentIdx = 0, fns, res = {};

        var next = function(/*arguments*/) {
            if(currentIdx < fns.length) {
                var fn = fns[currentIdx];
                currentIdx++;
                fn.apply(null, arguments);
            }
        };

        fns = (typeof listFn === 'function') ? listFn(next, res) : [];
        if(typeof lastFn === 'function') {
	        fns.push(function() { lastFn(res); });
        }
        next();
    }
}