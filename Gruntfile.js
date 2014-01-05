/*global module:false*/
module.exports = function (grunt) {

	grunt.initConfig({
		buster: {
			"dist": {
			}
		},
		watch: {
			"unit-tests": {
				files: [
					"lib/**/*.js",
					"lib/*.js",
					"test/**/*.js",
					"test/*.js"
				],
				tasks: ["test"]
			}
		}
	});

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	grunt.registerTask("default", ["test"]);
	grunt.registerTask("test", "Run unit tests", ["buster"]);

};
