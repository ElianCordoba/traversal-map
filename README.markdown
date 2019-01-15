[![Build Status](https://travis-ci.org/ElianCordoba/traversal-map.svg?branch=master)](https://travis-ci.org/ElianCordoba/traversal-map)
[![Coverage Status](https://coveralls.io/repos/github/ElianCordoba/traversal-map/badge.svg?branch=master)](https://coveralls.io/github/ElianCordoba/traversal-map?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/eliancordoba/traversal-map/badge)](https://www.codefactor.io/repository/github/eliancordoba/traversal-map)

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

traversalMap(data, (value: any, keyOrIndex: string | number, path: string) => {
  console.log(`${value} / ${keyOrIndex} / ${path}`);
});

/*
  1 / a / a
  2 / b / b
  [object Object] / c / c
  3 / d / c.d
  a.b.c / e / c.e
  a / 0 / c.e[0]
  b / 1 / c.e[1]
  c / 2 / c.e[2]
*/
```
## Api

traversalMap(target, callbackFn, options);

| Parameter   	| Type                                                             	| Description                                                                                                                                                                                	|
|-------------	|------------------------------------------------------------------	|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| target*     	| Object or Array or ArrayLike**                                     	| The object which will be traversed                                                                                                                                                         	|
| callbackFn* 	| (value: any, keyOrIndex?: string or number, path?: string) => any 	| - value: Value of the current position.  - keyOrIndex `optional`: Identifier of the current position, key for object and index for arrays.  - path `optional`: Path to the current position. 	|
| options?    	| useDotNotationOnKeys: boolean                                    	| Default true. When set to false insted of this: ` a.b.c `  You will get ` a['b']['c'] `                                                                                                     	|
```

* = Required paramter.
? = Optional paramter.
** = ArrayLike is an object whitch is neither null nor a function (Definition of function in ./util/typeCheckers isFunction) and it has a lenght property of type number.
```
## About
I needed to iterate over a deeply nested object and gather the path to each property, so I looked around and found [for-each-safe](https://github.com/npetruzzelli/for-each-safe). I liked the idea so I forked, migrated it to Typescript, added tests and made it faster and smaller (mine is less safe than the original as it checks for less edgy cases, but for my purpose and the majority of people out there, is more than enough).
