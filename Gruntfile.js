/*global module:false*/
module.exports = function (grunt) {

	grunt.initConfig({
		buster: {
			dist: {
				test: {
//					reporter: "specification"
				}
			}
		},

		watch: {
			unitTests: {
				files: [
					"index.js",
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
