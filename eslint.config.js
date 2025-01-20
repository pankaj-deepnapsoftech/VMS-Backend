import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config} */
export default [
  // Define language options (globals and parser options)
  {
    languageOptions: {
      globals: globals.browser, // Define browser globals
      parserOptions: {
        ecmaVersion: 12, // ECMAScript 2021 (ES12)
        sourceType: 'module', // Enable ES6 module support (import/export)
      },
    },
  },
  
  
  pluginJs.configs.recommended,

  {
    rules: {
      'no-console': 'warn', 
      'no-unused-vars': 'warn', 
      'indent': ['error', 2], 
      'semi': ['error', 'always'], 
    },
  },
];
