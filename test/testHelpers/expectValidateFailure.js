var testValidator = require("./testValidator");
module.exports = function (validator, value, expectedFormats) {
	return function shouldFail() {
		return testValidator(this, validator, value, false, expectedFormats);
	}
};

