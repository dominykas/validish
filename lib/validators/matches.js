var Q = require("q");

module.exports = function (regexp, invert) {

	return function(val) {
		var res = regexp.test(val);
		return Q.resolve(!!invert ? !res : res);
	}
};
