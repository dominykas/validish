var validators = require("../../index.js").validators;
var shouldFail = require("../testHelpers/expectValidateFailure");
var shouldPass = require("../testHelpers/expectValidateSuccess");

buster.testCase("validish.validators.minLength(min)", {

	"fail when undefined": shouldFail(validators.minLength(2)),
	"fail when null": shouldFail(validators.minLength(2), null),
	"ok when equal to min": shouldPass(validators.minLength(3), "xxx"),
	"ok when longer than min": shouldPass(validators.minLength(3), "xxxx"),
	"fail when too short": shouldFail(validators.minLength(2), "x", {min: 2}),
	"fail when no min": shouldFail(validators.minLength(), "x", {min: Infinity})

});
