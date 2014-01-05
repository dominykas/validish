var validish = require("../../index");

module.exports = function (tc, validator, value, expectedSuccess, expectedFormats) {
	return validish
		.validate({field: value}, {field: [
			{ validator: validator, errorMessage: "Validation failed" }
		]})
		.then(function (res) {
			if (expectedSuccess) {
				expect(res.errors).toBeNull("Expected validation to pass");
			} else {
				expect(res.errors).not.toBeNull("Expected errors to be set");
				expect(res.errors.field.length).toEqual(1, "Expected validation failure");
				expect(res.errors.field[0].errorMessage).toEqual("Validation failed", "Where's MY message?!");
				if (expectedFormats) {
					expect(res.errors.field[0].formats).toEqual(expectedFormats);
				}
			}
		});
};
