(function () { // IIFE runs in "global" context in all environments (node, browser, etc)
	var buster = this.buster = require('buster');
	this.assert = buster.assert;
	this.refute = buster.refute;
	this.expect = buster.expect;
}());
