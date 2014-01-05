var Q = require("q");

module.exports = function(validValues) {

	if (!Array.isArray(validValues)) {
		validValues = [].slice.call(arguments);
	}

	return function(val) {
		return Q.resolve(validValues.indexOf(val) >= 0);
	}
};
