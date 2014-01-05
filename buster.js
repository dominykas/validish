module.exports["node"] = {
	rootPath: ".",
	environment: "node",
	tests: [
		"test/*.test.js",
		"test/**/*.test.js"
	],
	testHelpers: [
		"test/testHelpers/*.js"
	]
};
