var Q = require("q");
var validish = require("../index.js");


var testValidation = function (tc, obj, config, expectedErrors, done) {

	validish
		.validate(obj, config)
		.then(function (validationResult) {

			expect(validationResult.errors).toEqual(expectedErrors);

		})
		.fail(tc.mock().never())
		.fin(done).done();

};

var testValidator = function (tc, validator, value, expectedSuccess, expectedFormats, done) {
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
		})
		.fail(tc.mock().never())
		.fin(done)
		.done();
};

var shouldFail = function (validator, value, expectedFormats) {
	return function shouldFail(done) {
		testValidator(this, validator, value, false, expectedFormats, done);
	}
};

var shouldPass = function (validator, value) {
	return function shouldPass(done) {
		testValidator(this, validator, value, true, null, done);
	}
};

var alwaysFailValidator = function () {
	return Q.resolve(false)
};
var alwaysPassValidator = function () {
	return Q.resolve(true)
};

var validators = validish.validators;

buster.testCase("validish.validate()", {

	"empty config and empty object result in no errors": function (done) {

		testValidation(this, {}, {}, null, done);

	},

	"empty list of validators results in no errors": function (done) {

		validish.validate({}, {field: []})
			.then(function (res) {
				expect(res.errors).toBeNull();
			})
			.fail(this.mock().never())
			.fin(done)
			.done();
	},

	"returns errors when validator fails": function (done) {

		var validatorSpy = this.spy(alwaysFailValidator);
		var config = {
			fieldName: [
				{
					validator: validatorSpy,
					errorMessage: "myErrors.somethingFailed"
				}
			]
		};

		var expectedErrors = {
			fieldName: [
				{errorMessage: "myErrors.somethingFailed"}
			]
		};

		testValidation(this, {}, config, expectedErrors, function () {
			expect(validatorSpy).toHaveBeenCalledOnce();
			done();
		});

	},

	"no errors when validator passes": function (done) {

		var validatorSpy = this.spy(alwaysPassValidator);

		var config = {
			fieldName: [
				{
					validator: validatorSpy,
					errorMessage: "myErrors.shouldNotHappen"
				}
			]
		};

		testValidation(this, {}, config, null, function () {
			expect(validatorSpy).toHaveBeenCalledOnce();
			done();
		});
	},

	"multiple validators on one field (fail last)": function (done) {

		var passSpy = this.spy(alwaysPassValidator);
		var failSpy = this.spy(alwaysFailValidator);

		var config = {
			fieldName: [
				{
					validator: passSpy,
					errorMessage: "myErrors.shouldNotHappen"
				},
				{
					validator: failSpy,
					errorMessage: "myErrors.somethingFailed"
				}
			]
		};

		var expectedErrors = {
			fieldName: [
				{errorMessage: "myErrors.somethingFailed"}
			]
		};

		testValidation(this, {}, config, expectedErrors, function () {
			expect(passSpy).toHaveBeenCalledOnce();
			expect(failSpy).toHaveBeenCalledOnce();
			done();
		});
	},

	"multiple validators on one field (fail first - does not call pass)": function (done) {

		var passSpy = this.spy(alwaysPassValidator);
		var failSpy = this.spy(alwaysFailValidator);

		var config = {
			fieldName: [
				{
					validator: failSpy,
					errorMessage: "myErrors.somethingFailed"
				},
				{
					validator: passSpy,
					errorMessage: "myErrors.shouldNotHappen"
				}
			]
		};

		var expectedErrors = {
			fieldName: [
				{errorMessage: "myErrors.somethingFailed"}
			]
		};

		testValidation(this, {}, config, expectedErrors, function () {
			expect(failSpy).toHaveBeenCalledOnce();
			expect(passSpy).not.toHaveBeenCalled();
			done();
		});
	},

	"should pass correct values and context into validators": function (done) {

		var validatorSpy = this.spy(alwaysPassValidator);

		var config = {
			fieldName: [
				{
					validator: validatorSpy,
					errorMessage: "myErrors.shouldNotHappen"
				}
			]
		};

		var obj = {
			fieldName: "fieldValue"
		};

		testValidation(this, obj, config, null, function () {
			expect(validatorSpy).toHaveBeenCalledOnce();
			var withArgs = validatorSpy.getCall(0).args;
			expect(withArgs[0]).toEqual("fieldValue");

			var withCtx = withArgs[1];
			withCtx.get("fieldName").then(function (v) {
				expect(v).toEqual("fieldValue");
				done();
			});
		});

	},

	"multiple fields": function (done) {

		var validatorSpy = this.spy(alwaysPassValidator);

		var config = {
			fieldOne: [
				{
					validator: validatorSpy,
					errorMessage: "myErrors.shouldNotHappen"
				}
			],
			fieldTwo: [
				{
					validator: validatorSpy,
					errorMessage: "myErrors.shouldNotHappen"
				}
			]
		};

		var obj = {
			fieldOne: "one",
			fieldTwo: "two"
		};

		testValidation(this, obj, config, null, function () {
			expect(validatorSpy).toHaveBeenCalledWith("one");
			expect(validatorSpy).toHaveBeenCalledWith("two");
			done();
		});

	},

	"should accept results object from validator": {

		"pass": function (done) {
			var config = {
				fieldName: [
					{
						validator: function () {
							return Q.resolve({isValid: true})
						},
						errorMessage: "myErrors.somethingFailed"
					}
				]
			};

			testValidation(this, {}, config, null, function () {
				done();
			});
		},

		"fail with formats": function (done) {

			var config = {
				fieldName: [
					{
						validator: function () {
							return Q.resolve({isValid: false, formats: {max: 500}});
						},
						errorMessage: "myErrors.somethingFailed"
					}
				]
			};

			var expectedErrors = {
				fieldName: [
					{
						errorMessage: "myErrors.somethingFailed",
						formats: {max: 500}
					}
				]
			};

			testValidation(this, {}, config, expectedErrors, function () {
				done();
			});
		}

	}
});

buster.testCase("validish.validators.required()", {

	"fail when undefined": shouldFail(validators.required()),
	"fail when null": shouldFail(validators.required(), null),
	"fail when string is empty": shouldFail(validators.required(), ""),
	"fail when string is spacey": shouldFail(validators.required(), " "),
	"ok": shouldPass(validators.required(), "hello")

});

buster.testCase("validish.validators.maxLength(max)", {

	"ok when undefined": shouldPass(validators.maxLength(100)),
	"ok when null": shouldPass(validators.maxLength(100), null),
	"ok when less than max": shouldPass(validators.maxLength(2), "x"),
	"ok when equal to max": shouldPass(validators.maxLength(2), "xx"),
	"fail when too long": shouldFail(validators.maxLength(2), "xxx", {max: 2}),
	"fail when no max": shouldFail(validators.maxLength(), "x", {max: -1})

});

buster.testCase("validish.validators.minLength(min)", {

	"fail when undefined": shouldFail(validators.minLength(2)),
	"fail when null": shouldFail(validators.minLength(2), null),
	"ok when equal to min": shouldPass(validators.minLength(3), "xxx"),
	"ok when longer than min": shouldPass(validators.minLength(3), "xxxx"),
	"fail when too short": shouldFail(validators.minLength(2), "x", {min: 2}),
	"fail when no min": shouldFail(validators.minLength(), "x", {min: Infinity})

});

buster.testCase("validish.validators.matches(regexp)", {

	"ok when matches": shouldPass(validators.matches(/./), "x"),
	"fail when doesn't match": shouldFail(validators.matches(/^\w$/), "."),
	"ok when doesn't match (invert)": shouldPass(validators.matches(/^\w$/, true), "."),
	"fail when matches (invert)": shouldFail(validators.matches(/./, true), "x")

});

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
