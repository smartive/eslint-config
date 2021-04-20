# @smartive/eslint-config

This package provides smartive's default [eslint](https://eslint.org/) configuration.

## Installation

```sh
$ npm install eslint @smartive/eslint-config -D
```

## Usage

Create a `.eslintrc` file in the root of your project's directory (it should live where `package.json` does). Your `.eslintrc` file should look like this:

```
{
  "extends": [
    "@smartive/eslint-config"
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
