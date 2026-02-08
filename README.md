# @smartive/eslint-config

This package provides smartive's default [eslint](https://eslint.org/) configuration.

## Installation

```sh
$ npm install eslint @smartive/eslint-config -D
```

## Usage

This package offers three different rule sets, one for plain TypeScript applications, a separate one for React applications and one that works well with Next.js applications (minimum supported version is Next.js v16).

### Flat Config (`eslint.config.mjs`)

```javascript
import { config } from '@smartive/eslint-config'

// For plain TS applications ..
export default config('typescript');

// .. or React applications
export default config('react');

// .. or Next.js applications
// make sure to add `eslint-config-next@16`
// to your devDependencies
export default config('nextjs');
```

### NPM scripts

To use eslint add the following to your package.json:

```json
"scripts": {
  "lint": "eslint {your source directory}",
  "lint:fix": "eslint {your source directory} --fix"
}
```
