var Q = require("q");

module.exports = function(min) {

	min = min || Infinity;

	return function minLengthValidator(val) {
		if (val != null && val.length >= min) {
			return Q.resolve(true)
		}
		return Q.resolve({isValid: false, formats:{min:min}});
	};
};
