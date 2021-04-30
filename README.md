# @smartive/eslint-config

This package provides smartive's default [eslint](https://eslint.org/) configuration.

## Installation

```sh
$ npm install eslint @smartive/eslint-config -D
```

## Usage

Create a `.eslintrc` file in the root of your project's directory (it should live where `package.json` does). This package offers two different rulesets, on for plain TypeScript applications (`@smartive/eslint-config`) and a separate one for React applications (`@smartive/eslint-config`). Your `.eslintrc` file should look like this:

### Plain TypeScript applications

```
{
  "extends": [
    "@smartive/eslint-config"
  ]
}
```

### React applications

```
{
  "extends": [
    "@smartive/eslint-config/react"
  ]
}
```

To use eslint add the following to your package.json:

```json
"scripts": {
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```
