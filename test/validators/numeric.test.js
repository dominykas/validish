var validators = require("../../index.js").validators;
var shouldFail = require("../testHelpers/expectValidateFailure");
var shouldPass = require("../testHelpers/expectValidateSuccess");

buster.testCase("validish.validators.numeric()", {

	"fail when undefined": shouldFail(validators.numeric()),
	"fail when null": shouldFail(validators.numeric(), null),
	"fail when NaN": shouldFail(validators.numeric(), "abc"),
	"pass when null and empty allowed": shouldPass(validators.numeric({allowEmpty: true}), null, {allowEmpty: true}),
	"pass when empty string and empty allowed": shouldPass(validators.numeric({allowEmpty: true}), "", {allowEmpty: true}),
	"fail when less than min": shouldFail(validators.numeric({min: 10}), 5, {min: 10}),
	"pass when more than min": shouldPass(validators.numeric({min: 10}), 15),
	"pass when equal to min": shouldPass(validators.numeric({min: 10}), 10),
	"fail when more than max": shouldFail(validators.numeric({max: 1}), 5, {max: 1}),
	"pass when less than max": shouldPass(validators.numeric({max: 1}), 0),
	"pass when equal to max": shouldPass(validators.numeric({max: 1}), 1)

});
