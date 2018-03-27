module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 8,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "rules": {
        "new-cap": ["error", { "capIsNew": false }] 
    }
};