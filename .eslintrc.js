module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "rules": {
        "new-cap": ["error", { "capIsNew": false }] 
    }
};