var testValidator = require("./testValidator");

module.exports = function (validator, value) {
	return function shouldPass() {
		return testValidator(this, validator, value, true, null);
	}
};
