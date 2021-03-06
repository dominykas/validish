var Q = require("q");

/**
 * Validate a field based on its configuration and context
 *
 * @param fieldName
 * @param fieldValue
 * @param fieldConfig
 * @param ctx
 * @returns A promise for an array of errors
 */
var validateField = function validateField(fieldName, fieldValue, fieldConfig, ctx) {

	if (fieldConfig.length == 0) {
		return Q.resolve(null);
	}

	var fieldErrors = [];
	var last = fieldConfig.length - 1;

	var validateConfigItem = function (i) {

		var fieldConfigItem = fieldConfig[i];

		return fieldConfigItem
			.validator(fieldValue, ctx)
			.then(function (result) {
				// rationale:
				//  extension point for configurable "should call next if invalid"
				//  or "should not call next if valid"
				var shouldCallNext = i < last;

				// we expect an object with a bool isValid, but we'll gladly accept a simple "false/true"
				if (result === false || result === true) {
					result = { isValid: result };
				}

				// if the validator returned "false" - push the error message into an array
				// the message is an object with "errorMessage" to enable extension points
				// for i18n and parameterized messages
				if (result.isValid === false) {

					var errorObj = {
						errorMessage: fieldConfigItem.errorMessage
					};
					if (result.formats) {
						errorObj.formats = result.formats;
					}

					fieldErrors.push(errorObj);

					// by default - do not validate further, when validation fails
					shouldCallNext = !!fieldConfigItem.proceedIfInvalid;
				}

				return shouldCallNext ? validateConfigItem(++i) : null;
			});

	};

	// kick of a validation chain starting with the first validator
	return validateConfigItem(0).then(function () {
		// after all validators are done - return list of errors or null
		return fieldErrors.length > 0 ? fieldErrors : null;
	});

};

/**
 * Validate an object based on its config
 *
 * @param obj
 * @param config
 * @returns A promise for an object with 'errors' array
 */
var validate = function validate(obj, config) {

	// create simple validation context - get(fieldName) returns a promise for the value of that field
	// rationale: we might need to inject promises into the validatable object (e.g. user from the database)
	var validationContext = {
		get: function (key) {
			return Q.resolve(obj[key]);
		}
	};

	// create the list of all promises for all validatable fields in the config
	// each field gets validated as a "separate" field, with a context
	var promisesForAllFields = Object.keys(config).map(function (fieldName) {

		// validateField returns an array of errors, or null if field is valid
		return validateField(fieldName, obj[fieldName], config[fieldName], validationContext)
			.then(function (e) {
				// we then transform that to add a key, so that we can rebuild the final
				// result into one big {field:[errors], field:[errors]}
				// note: we could do this "mapping" inside validateField(), but it wouldn't
				// make sense for the validateField() to work that way on its own
				return [fieldName, e];
			});

	});

	return Q.all(promisesForAllFields)
		// strip out fields which didn't have any errors
		.then(function (allResults) {
			return allResults.filter(function (v) {
				return !!v[1];
			})
		})
		// return 'errors' as a property - we might want to add more meta data
		// if all fields validated successfully - errors is null
		.then(function (errors) {
			if (errors.length == 0) {
				return {errors:null}
			}

			var errorMap = {};
			errors.forEach(function (e) {
				errorMap[e[0]] = e[1];
			});

			return {
				errors: errorMap
			};
		});

};

module.exports = validate;
