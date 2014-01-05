var Q = require("q");
var EMPTY_SPACES = /^[\s\t\r\n]*$/;

module.exports = function ()
{
	return function requiredValidator(whatAreWeLivingFor) {
		return Q.resolve(!!whatAreWeLivingFor && !EMPTY_SPACES.test(whatAreWeLivingFor));
	};
};
