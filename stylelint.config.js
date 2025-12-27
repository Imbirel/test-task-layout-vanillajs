/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-clean-order"
  ],
  rules: {
    "selector-class-pattern": [
      "^[a-z]([a-z0-9-]+)?(__[a-z0-9]([a-z0-9-]+)?)?(--[a-z0-9]([a-z0-9-]+)?)?$",
      {
        message: (selector) => `Селектор "${selector}" не соответствует БЭМ (block__element--modifier)`,
        severity: "error"
      }
    ],
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["export", "deep", "global"]
      }
    ],
    "no-descending-specificity": null,
    "scss/at-rule-no-unknown": true,
    "block-no-empty": true,
    "max-nesting-depth": 3
  },
  ignoreFiles: ["dist/**/*", "node_modules/**/*"]
};
