/**
 * @type import("eslint").Linter.Config
 */
module.exports = {
  root: true,
  plugins: ["@poyoho/config"],
  extends: [
    "plugin:@poyoho/config/js",
  ],
  rules: {
    "max-lines-per-function": "off",
    "sonarjs/cognitive-complexity": "off",
    "consistent-return": "off",
    "max-params": "off",
    "complexity": "off"
  }
}
