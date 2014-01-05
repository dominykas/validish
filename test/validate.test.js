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

var alwaysFailValidator = function () {
	return Q.resolve(false)
};
var alwaysPassValidator = function () {
	return Q.resolve(true)
};

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
