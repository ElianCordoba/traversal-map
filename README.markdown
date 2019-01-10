[![Build Status](https://travis-ci.org/ElianCordoba/traversal-map.svg?branch=master)](https://travis-ci.org/ElianCordoba/traversal-map)

# Traversal map

Iterate through all elements in a object or array calling a callback function.

## Installation Using [npm](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)

```
npm install traversal-map
```

## Example Usage

```typescript
import traversalMap from 'traversal-map';

const data = {
  a: 1,
  b: 2,
  c:  {
    d: 3,
    e: [ 'a', 'b', 'c' ]
  }
};

traversalMap(data, (value, keyOrIndex, path)) {
  console.log(`${value} / ${keyOrIndex} / ${path}`)
});

/*
  1 / a / ''
  2 / b / ''
  { d: 3, e: [ 'a', 'b', 'c' ] } / c / ''
  3 / d / c.d
  [ 'a', 'b', 'c' ] / e / 'c.e'
  'a' / 0 / c.e[0]
  'b' / 1 / c.e[1]
  'c' / 2 / c.e[2]
*/
```

## About
I needed to iterate over a deeply nested object and gather the path to each property, so I looked around and found [for-each-safe](https://github.com/npetruzzelli/for-each-safe). I liked the idea so I forked, migrate it to Typescript, added tests and made it faster and smaller (mine is less safe than the original as it checks for less edgy cases, but for my purpose, and the majority of people out there is more than enough).
