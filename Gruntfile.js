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
		},
		"bump": {
			"options": {
				commitMessage: 'release %VERSION%',
				commitFiles: ["-a"],
				tagName: '%VERSION%',
				tagMessage: 'version %VERSION%',
				pushTo: 'origin'
			}
		}

	});

	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	grunt.registerTask("default", ["test"]);
	grunt.registerTask("test", "Run unit tests", ["buster"]);

	grunt.registerTask("release", function () {
		var bump = grunt.option("bump");
		if (bump != "patch" && bump != "minor" && bump != "major") grunt.fail.fatal("Please pass --bump");
		grunt.task.run(["checkbranch:master", "checkpending", "bump:" + bump]);
	});

};
