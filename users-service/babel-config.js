module.exports = {
  plugins: [
    [
      "nodule-resolver",
      {
        alias: {
          "#root": "./src"
        }
      }
    ]
  ],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          nonde: "current"
        }
      }
    ]
  ]
};
