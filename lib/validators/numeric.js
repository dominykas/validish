var Q = require("q");

module.exports = function(options) {

	options = options || {};

	return function(val) {
		var isValEmpty = (val == null || val === "");
		var numVal = parseFloat(val);

		if (isValEmpty && options.allowEmpty) {
			return Q.resolve(true);
		}

		if (isValEmpty || isNaN(numVal))
			return Q.resolve({ isValid: false, formats: options });

		if (options.min && numVal < options.min)
			return Q.resolve({ isValid: false, formats: options });

		if (options.max && numVal > options.max)
			return Q.resolve({ isValid: false, formats: options });

		return Q.resolve(true);
	}
};
