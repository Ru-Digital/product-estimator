// .stylelintrc.js
module.exports = {
  "extends": "stylelint-config-standard-scss", // GOOD: This is key for SCSS standards.
  "plugins": [
    "stylelint-order" // GOOD: For consistent property ordering.
  ],
  "rules": {
    // Well-configured and modern approach for this rule.
    "at-rule-empty-line-before": [
      "always",
      {
        "except": [
          "blockless-after-same-name-blockless",
          "first-nested"
        ],
        "ignore": [
          "after-comment"
        ],
        "ignoreAtRules": [ // Good for modern SCSS module system.
          "use",
          "forward",
          "import",
          "include",
          "extend"
        ]
      }
    ],

    "at-rule-no-unknown": null, // CORRECT: Disables the core rule in favor of scss/at-rule-no-unknown.

    "order/properties-alphabetical-order": true,

    "selector-class-pattern": null,
    "selector-id-pattern": null,
    "custom-property-pattern": null,
    "no-descending-specificity": null, // CONSIDER: Standard configs usually enable this.
    "color-function-notation": "legacy", // CONSIDER: "modern" for newer CSS standard.
    "alpha-value-notation": "number",
    "selector-not-notation": "simple",
    "media-feature-range-notation": "prefix", // CONSIDER: "context" for newer CSS standard.
    "rule-empty-line-before": "always",
    "shorthand-property-no-redundant-values": true, // GOOD
    "declaration-empty-line-before": "never",
    "no-empty-source": true, // GOOD

    "scss/dollar-variable-pattern": null,
    "scss/at-extend-no-missing-placeholder": null, // CONSIDER: Enabling this for best practice.
    "scss/at-rule-no-unknown": true, // CORRECT: Enables the SCSS-aware version.

    // Temporarily disable rules causing deprecation warnings
    "scss/at-if-closing-brace-newline-after": null,     // Was "always-last-in-chain"
    "scss/at-if-closing-brace-space-after": null,      // Was "always-intermediate"
    "scss/at-else-closing-brace-newline-after": null,  // Was "always-last-in-chain"
    "scss/at-else-closing-brace-space-after": null,   // Was "always-intermediate"

    // Other SCSS @if/@else formatting rules (these were not causing the listed deprecation warnings)
    "scss/at-else-empty-line-before": null, // Disabled to handle various SCSS formatting styles
    "scss/at-if-no-null": null, // CONSIDER: Enabling this (removing or setting to true).
    "scss/at-else-if-parentheses-space-before": "always"
  },
  "defaultSeverity": "warning"
};
