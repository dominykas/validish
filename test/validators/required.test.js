var validators = require("../../index.js").validators;
var shouldFail = require("../testHelpers/expectValidateFailure");
var shouldPass = require("../testHelpers/expectValidateSuccess");

buster.testCase("validish.validators.required()", {

	"fail when undefined": shouldFail(validators.required()),
	"fail when null": shouldFail(validators.required(), null),
	"fail when string is empty": shouldFail(validators.required(), ""),
	"fail when string is spacey": shouldFail(validators.required(), " "),
	"ok": shouldPass(validators.required(), "hello")

});
