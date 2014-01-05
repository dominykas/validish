var validators = require("../../index.js").validators;
var shouldFail = require("../testHelpers/expectValidateFailure");
var shouldPass = require("../testHelpers/expectValidateSuccess");

buster.testCase("validish.validators.matches(regexp)", {

	"ok when matches": shouldPass(validators.matches(/./), "x"),
	"fail when doesn't match": shouldFail(validators.matches(/^\w$/), "."),
	"ok when doesn't match (invert)": shouldPass(validators.matches(/^\w$/, true), "."),
	"fail when matches (invert)": shouldFail(validators.matches(/./, true), "x")

});
