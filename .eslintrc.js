module.exports = {
    extends: [
        "standard",
        "eslint:recommended"
    ],
    env: {
        "node": true,
        "es6": true,
        "commonjs": true,
    },
    parserOptions: {
        "ecmaVersion": 2018
    },
    plugins: [
        "node",
        "standard",
        "promise",
        "import"
    ],
    rules: {
        "arrow-parens": [2, "as-needed"],
        "eqeqeq": 0,
        "no-return-assign": 0, // fails for arrow functions
        "no-var": 2,
        "semi": [2, "always"],
        "space-before-function-paren": [2, "never"],
        "yoda": 0,
        "arrow-spacing": 2,
        "dot-location": [2, "property"],
        "prefer-arrow-callback": 2,
        "no-duplicate-imports": 1,
        "no-console": "off", //可以使用console
        "class-methods-use-this": 0,
        "quotes": [1, "double"],
    }
};