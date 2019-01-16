import traversalMap from './index';
import bigObject from './bigObject';

// Variables
let keys = [] as any;
let values = [] as any;

// Sample data
const simpleObject = { a: 1, b: 2, c: { d: 3, e: { f: 4 } }, g: 5 };
const simpleArray = [1, 2, 'a', null, {}, []];

const nestedObject = {
  a: 1,
  b: null,
  c: { d: true, e: [{}, { f: 'asd' }, [1, 2, 3]] },
  g: () => {}
};

// Functions
const identity = i => i;

afterEach(() => {
  keys = [];
  values = [];
});

test('Should iterate through all levels of an object', () => {
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
  traversalMap(simpleArray, value => values.push(value));

  expect(values).toEqual([1, 2, 'a', null, {}, []]);
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

test('Should treat length property as a normal properpy if the value is not a number', () => {
  traversalMap({ a: { length: 'ups' } }, (value, key) => keys.push(key));
  expect(keys).toEqual(['a', 'length']);
});

test('Should treat length property as index if the value is a number', () => {
  traversalMap({ a: { length: 1 } }, (value, key) => keys.push(key));
  expect(keys).toEqual(['a']);
});

test('Should return the right path', () => {
  let pathA, pathB, pathC;
  traversalMap(nestedObject, (value, key, path) => {
    if (key === 'd') {
      pathA = path;
    } else if (key === 'f') {
      pathB = path;
    } else if (key === 'g') {
      pathC = path;
    }
  });

  expect(pathA).toBe('c.d');
  expect(pathB).toBe('c.e[1].f');
  expect(pathC).toBe('g');
});

test('Should return path in bracked notation if the option useDotNotationOnKeys is disabled', () => {
  let pathA, pathB, pathC;
  traversalMap(
    nestedObject,
    (value, key, path) => {
      if (key === 'd') {
        pathA = path;
      } else if (key === 'f') {
        pathB = path;
      } else if (key === 'g') {
        pathC = path;
      }
    },
    { useDotNotationOnKeys: false }
  );

  expect(pathA).toBe(`['c']['d']`);
  expect(pathB).toBe(`['c']['e'][1]['f']`);
  expect(pathC).toBe(`['g']`);
});

test('Should skip nodes if the option skipNodes is eneabled', () => {
  traversalMap(simpleObject, (value, key) => keys.push(key), {
    skipNodes: true
  });
  expect(keys).toEqual(['a', 'b', 'd', 'f', 'g']);
  keys = [];

  traversalMap(nestedObject, (value, key) => keys.push(key), {
    skipNodes: true
  });
  expect(keys).toEqual(['a', 'b', 'd', 'f', 0, 1, 2, 'g']);
});

test('Should handle big objects properly', () => {
  expect(() => traversalMap(bigObject, identity)).not.toThrow();
});

test.only('Should break at current depth when returned 10', () => {
  traversalMap(simpleObject, (value, key) => {
    if (key === 'd') {
      return 10;
    }
    keys.push(key);
  });
  expect(keys).toEqual(['a', 'b', 'c', 'g']);
});

/* Uncomment to debug the library
test.only('Debug test', () => {
  traversalMap(simpleObject, () => {
    debugger;
  });
});
*/
