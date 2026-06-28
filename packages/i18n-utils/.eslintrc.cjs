module.exports = {
  extends: ["@feedyruby/eslint-config/library.js"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
};
