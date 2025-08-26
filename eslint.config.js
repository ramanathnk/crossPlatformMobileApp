const {
    defineConfig,
} = require("eslint/config");

const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const react = require("eslint-plugin-react");
const reactNative = require("eslint-plugin-react-native");
const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    extends: compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react-native/all",
        "prettier",
    ),

    plugins: {
        "@typescript-eslint": typescriptEslint,
        react,
        "react-native": reactNative,
    },

    languageOptions: {
        parser: tsParser,

        globals: {
            ...reactNative.environments["react-native"]["react-native"],
            ...globals.node,
        },
    },

    rules: {},

    settings: {
        react: {
            version: "detect",
        },
    },
}]);