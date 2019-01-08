import traversalMap from './index';

// Sample data
const simpleObject = { a: 1, b: 2, c: { d: 3, e: { f: 4 } }, g: 5 };
const simpleArray = [1, 2, 'a', null, {}, []];

// Functions
const identity = i => i;

test('Should iterate through all levels of an object', () => {
  let keys = [] as any;
  let values = [] as any;

  traversalMap(simpleObject, (value, key) => {
    keys.push(key);

    // Prevent the nodes itself from going into the array @TODO Add option to disable this
    if (typeof value === 'number') {
      values.push(value);
    }
  });
  expect(keys).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g']);
  expect(values).toEqual([1, 2, 3, 4, 5]);
});

test('Should iterate through all elements in an array', () => {
  let items = [] as any;
  traversalMap(simpleArray, item => items.push(item));

  expect(items).toEqual([1, 2, 'a', null, {}, []]);
});

test('Should throw on invalid options', () => {
  expect(() =>
    traversalMap(simpleObject, identity, {
      useDotNotationOnKeys: 'ups' as any
    })
  ).toThrow();
});

test('Should return right error message', () => {
  expect(() =>
    traversalMap(simpleObject, identity, {
      useDotNotationOnKeys: 1337 as any
    })
  ).toThrowError(
    'Ivalid option, useDotNotationOnKeys sould be a boolean, instead got a number'
  );
});
