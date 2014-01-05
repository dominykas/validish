var validators = require("../../index.js").validators;
var shouldFail = require("../testHelpers/expectValidateFailure");
var shouldPass = require("../testHelpers/expectValidateSuccess");

buster.testCase("validish.validators.maxLength(max)", {

	"ok when undefined": shouldPass(validators.maxLength(100)),
	"ok when null": shouldPass(validators.maxLength(100), null),
	"ok when less than max": shouldPass(validators.maxLength(2), "x"),
	"ok when equal to max": shouldPass(validators.maxLength(2), "xx"),
	"fail when too long": shouldFail(validators.maxLength(2), "xxx", {max: 2}),
	"fail when no max": shouldFail(validators.maxLength(), "x", {max: -1})

});
