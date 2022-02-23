module.exports = {
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": 0,
    "react/display-name": 0,
    "react/forbid-component-props": ["warn", { forbid: ["style", "className"] }],
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["./index", "plugin:react/recommended"],
  settings: {
    react: {
      pragma: "React",
      version: "detect",
    },
  },
  plugins: ["react", "react-hooks"],
};
