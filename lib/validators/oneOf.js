var _ = require("lodash"),
	Q = require("q");

module.exports = function(validValues) {

	if (!_.isArray(validValues)) {
		validValues = _.toArray(arguments);
	}

	return function(val) {
		return Q.resolve(_.contains(validValues, val));
	}
};
