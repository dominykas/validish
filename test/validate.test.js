var Q = require("q");
var validish = require("../index.js");

var testValidation = function (tc, obj, config, expectedErrors) {

	return validish.validate(obj, config)
		.then(function (validationResult) {

			expect(validationResult.errors).toEqual(expectedErrors);

		})

};

var alwaysFailValidator = function () {
	return Q.resolve(false)
};
var alwaysPassValidator = function () {
	return Q.resolve(true)
};

buster.testCase("validish.validate()", {

	"empty config and empty object result in no errors": function () {

		return testValidation(this, {}, {}, null);

	},

	"empty list of validators results in no errors": function () {

		return validish.validate({}, {field: []})
			.then(function (res) {
				expect(res.errors).toBeNull();
			});
	},

	"returns errors when validator fails": function () {

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

		return testValidation(this, {}, config, expectedErrors)
			.then(function () {
				expect(validatorSpy).toHaveBeenCalledOnce();
			});

	},

	"no errors when validator passes": function () {

		var validatorSpy = this.spy(alwaysPassValidator);

		var config = {
			fieldName: [
				{
					validator: validatorSpy,
					errorMessage: "myErrors.shouldNotHappen"
				}
			]
		};

		return testValidation(this, {}, config, null)
			.then(function () {
				expect(validatorSpy).toHaveBeenCalledOnce();
			});
	},

	"multiple validators on one field (fail last)": function () {

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

		return testValidation(this, {}, config, expectedErrors)
			.then(function () {
				expect(passSpy).toHaveBeenCalledOnce();
				expect(failSpy).toHaveBeenCalledOnce();
			});
	},

	"multiple validators on one field (fail first - does not call pass)": function () {

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

		return testValidation(this, {}, config, expectedErrors)
			.then(function () {
				expect(failSpy).toHaveBeenCalledOnce();
				expect(passSpy).not.toHaveBeenCalled();
			});
	},

	"should pass correct values and context into validators": function () {

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

		return testValidation(this, obj, config, null)
			.then(function () {
				expect(validatorSpy).toHaveBeenCalledOnce();
				var withArgs = validatorSpy.getCall(0).args;
				expect(withArgs[0]).toEqual("fieldValue");

				var withCtx = withArgs[1];
				return withCtx.get("fieldName");
			})
			.then(function (actualValue) {
				expect(actualValue).toEqual("fieldValue");
			});

	},

	"multiple fields": function () {

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

		return testValidation(this, obj, config, null)
			.then(function () {
				expect(validatorSpy).toHaveBeenCalledWith("one");
				expect(validatorSpy).toHaveBeenCalledWith("two");
			});

	},

	"multiple errors on a field (no proceed)": function () {
		var config = {
			badField: [
				{
					validator: alwaysFailValidator,
					errorMessage: "myErrors.one"
				},
				{
					validator: alwaysFailValidator,
					errorMessage: "myErrors.two"
				}
			]
		};

		var obj = {badField: "bad data"};

		return testValidation(this, obj, config, {
			badField: [
				{errorMessage: "myErrors.one"}
			]
		});
	},

	"multiple errors on a field (proceed)": function () {
		var config = {
			badField: [
				{
					validator: alwaysFailValidator,
					proceedIfInvalid: true,
					errorMessage: "myErrors.one"
				},
				{
					validator: alwaysFailValidator,
					errorMessage: "myErrors.two"
				}
			]
		};

		var obj = {badField: "bad data"};

		return testValidation(this, obj, config, {
			badField: [
				{errorMessage: "myErrors.one"},
				{errorMessage: "myErrors.two"}
			]
		});
	},

	"should accept results object from validator": {

		"pass": function () {
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

			return testValidation(this, {}, config, null);
		},

		"fail with formats": function () {

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

			return testValidation(this, {}, config, expectedErrors);
		}

	}

});
