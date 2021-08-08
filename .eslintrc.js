/**
 * @type import("eslint").Linter.Config
 */
module.exports = {
  root: true,
  plugins: ["@poyoho/config"],
  extends: [
    "plugin:@poyoho/config/ts",
    // "plugin:@poyoho/config/stat"
  ],
  rules: {
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "max-lines-per-function": "off",
    "@typescript-eslint/no-empty-function": "off",
    "sonarjs/cognitive-complexity": "off",
    "consistent-return": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "max-params": "off",
    "@typescript-eslint/ban-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "complexity": "off"
  }
}
