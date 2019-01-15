[![Build Status](https://travis-ci.org/ElianCordoba/traversal-map.svg?branch=master)](https://travis-ci.org/ElianCordoba/traversal-map)
[![Coverage Status](https://coveralls.io/repos/github/ElianCordoba/traversal-map/badge.svg?branch=master)](https://coveralls.io/github/ElianCordoba/traversal-map?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/eliancordoba/traversal-map/badge)](https://www.codefactor.io/repository/github/eliancordoba/traversal-map)
[![Known Vulnerabilities](https://snyk.io/test/github/ElianCordoba/traversal-map/badge.svg?targetFile=package.json)](https://snyk.io/test/github/ElianCordoba/traversal-map?targetFile=package.json)

# Traversal map

#### Iterate through all elements in a object or array calling a callback function.

## Features
- Blazing fast
- Types out of the box
- No dependencies
- Tiny

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

``` typescript 
  traversalMap(target, callbackFn, options?);
```

| Parameter   	| Type                                                             	| Description                                                                                                                                                                                	|
|-------------	|------------------------------------------------------------------	|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| target     	| Object or Array or ArrayLike*                                     	| The object which will be traversed                                                                                                                                                         	|
| callbackFn 	| (value: any, keyOrIndex?: string or number, path?: string) => any 	| - value: Value of the current position.  - keyOrIndex `optional`: Identifier of the current position, key for object and index for arrays.  - path `optional`: Path to the current position. 	|
| options?    	| useDotNotationOnKeys: boolean                                    	| Default true. When set to false insted of this: ` a.b.c `  You will get ` ['a']['b']['c'] `                                                                                                     	|


#### ? = Optional paramter.
#### * = ArrayLike is an object whitch is neither null nor a function (Definition of function in [./util/typeCheckers/isFunction](./src/utils/typeCheckers.ts#isFunction)) and it has a lenght property of type number.


## Flow Control

You can modify the flow of the iteration returning special values:

`'10' | false`: Break the iteration at the current depth skyping remaining sibling elements.

`'11'`: Break the iteration.

`'20'`: Skip child elements of the current element.

## Testing

```
npm run test            // Run tests once
npm run test-with-cover // Run tests once and get coverage information
npm run test-watch      // Tests in watch mode 
```

### Debugging:

```
npm run test-debug
```
This will run all test in watch mode also allowing you to put breakpoints , both in the tests and the code, then you have to launch `Debug Jest Tests` from vscode and you are good to go. You can uncoment the debug test in ./src/index.test.ts if you don't know where to start.

## About
I needed to iterate over a deeply nested object and gather the path to each property, so I looked around and found [for-each-safe](https://github.com/npetruzzelli/for-each-safe). I liked the idea so I clonned, migrated it to Typescript, added tests and made it faster and smaller (mine is less safe than the original as it checks for less edgy cases, but for my purpose and the majority of people out there, is more than enough).
