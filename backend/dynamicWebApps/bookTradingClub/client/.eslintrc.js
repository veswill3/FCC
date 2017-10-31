module.exports = {
  "env": {
    "browser": true,
    "jest": true,
  },
  "rules": {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "react/no-did-mount-set-state": [0],
    "prefer-promise-reject-errors": [0],
    "react/prop-types": [0], // lazy...
    "jsx-a11y/anchor-is-valid": [ "error", {
      "components": [ "Link" ],
      "specialLink": [ "to", "hrefLeft", "hrefRight" ],
      "aspects": [ "noHref", "invalidHref", "preferButton" ]
    }]
  }
};
