/* eslint-disable node/no-unpublished-require */

const svelte = require("rollup-plugin-svelte");
const { default: resolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { babel } = require("@rollup/plugin-babel");
const livereload = require("rollup-plugin-livereload");
const { terser } = require("rollup-plugin-terser");
const css = require("rollup-plugin-css-only");
const replace = require("rollup-plugin-replace");

const path = require("path");
const getPathToEnv = () => {
  const env = process.env.NODE_ENV || "development";
  return { path: path.resolve(__dirname, `.env.${env}`) };
};

require("dotenv").config(getPathToEnv());

const production = !process.env.ROLLUP_WATCH;

module.exports = {
  input: "frontend-src/main.js",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "public/bundle.js",
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),

    css({ output: "bundle.css" }),

    babel({
      extensions: [".js", ".mjs", ".svelte"],
      babelHelpers: "runtime",
      include: ["src/**", "node_modules/svelte/**"],
    }),

    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),

    commonjs(),

    replace({
      "process.env.HOST": JSON.stringify(process.env.HOST),
      "process.env.GITHUB_CLIENT_ID": JSON.stringify(process.env.GITHUB_CLIENT_ID),
      "process.env.GITHUB_CLIENT_SECRET": JSON.stringify(process.env.GITHUB_CLIENT_SECRET),
    }),

    !production && livereload("public"),

    production && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
