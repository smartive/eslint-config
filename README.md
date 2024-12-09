# @smartive/eslint-config

This package provides smartive's default [eslint](https://eslint.org/) configuration.

## Installation

```sh
$ npm install eslint @smartive/eslint-config -D
```

## Usage

This package offers two different rule sets, one for plain TypeScript applications and a separate one for React applications.

### Flat Config (`eslint.config.mjs`)

```javascript
import { config } from '@smartive/eslint-config'

// For plain TS applications ..
export default config('typescript');

// .. or React applications
export default config('react');

// .. or Next.js applications
// make sure to add `eslint-config-next` 
// to your devDependencies
export default config('nextjs');
```

### Legacy Config (`.eslintrc`)

```json
{
  "extends": [
    "@smartive/eslint-config/typescript-legacy" // Plain TS applications
    // or
    "@smartive/eslint-config/react-legacy"      // React applications
  ]
}
```

### NPM scripts

To use eslint add the following to your package.json:

```json
"scripts": {
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```
