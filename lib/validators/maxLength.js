var Q = require("q");

module.exports = function(max) {

	max = max || -1;

	return function maxLengthValidator(val) {
		if (!val || val.length <= max) {
			return Q.resolve(true)
		}
		return Q.resolve({isValid: false, formats:{max:max}});
	};

};
