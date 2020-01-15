module.exports = {
  extends: [
		"eslint:recommended",
		"plugin:react/recommended"
	],
	parser: "babel-eslint",
	env: {
		browser: true,
		node: true,
		es6: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: "module",
	},
	globals: {},
	plugins: [
		"promise",
		"node",
	],
  rules: {
  },
};
