var validators = require("../../index.js").validators;
var shouldFail = require("../testHelpers/expectValidateFailure");
var shouldPass = require("../testHelpers/expectValidateSuccess");

buster.testCase("validish.validators.oneOf(arg1, arg2, ...)", {

	"fail when no list of values": shouldFail(validators.oneOf(), ""),
	"pass when matches single arg": shouldPass(validators.oneOf("abc"), "abc"),
	"pass when matches one of args": shouldPass(validators.oneOf("abc", "def"), "def"),
	"fail when type mis-match": shouldFail(validators.oneOf(0, 1, 2), "2"),
	"pass when type matches": shouldPass(validators.oneOf(0, 1, 2), 2)
});

buster.testCase("validish.validators.oneOf(array)", {

	"pass when matches single arg": shouldPass(validators.oneOf(["abc"]), "abc"),
	"pass when matches one of args": shouldPass(validators.oneOf(["abc", "def"]), "def"),
	"fail when type mis-match": shouldFail(validators.oneOf([0, 1, 2]), "2"),
	"pass when type matches": shouldPass(validators.oneOf([0, 1, 2]), 2)

});
