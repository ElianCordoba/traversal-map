import traversalMap from '../index';

let data = {
  a: 1,
  b: 2,
  c: {
    d: 3,
    e: {
      f: 4
    }
  },
  g: 5
};

// Log all keys and values
// traversalMap(
//   data,
//   (value, key) => {
//     console.log(`${key}: ${value}`);
//   },
//   { skipNodes: true }
// );

// New object with keys transformed
// let newObj = {};
// traversalMap(
//   data,
//   (value, key: string) => {
//     newObj[`${key.toUpperCase()}`] = value; 
//   },
//   { skipNodes: true }
// );
// console.log(newObj)

// Real world use case:
// The actual motivation to write this library was because of a task that I needed to do in my old job, we were refactoring the server so we needed to test all the endpoins in both v1 and v2 to ensure that they
// returned the same property and value, so we took the response of every endpoint, used the function bellow to create some Postman test's.
let apiResponse = {
  _id: '123456789asdfgh',
  firstName: 'Elian',
  lastName: 'Cordoba',
  age: 21,
  active: true,
  favoritePlaces: [
    '11111',
    '22222',
    '33333'
  ],
  createdAt: '1998-02-10T00:00:00.000Z'
}

traversalMap(
  apiResponse,
  (value, key: string) => {
    console.log()
  },
  { skipNodes: true }
);

console.log(`pm.test("It should have ${key} property", function() {\n \t var jsonData = pm.response.json(); \n\t return pm.expect(jsonData.' + (parent ? parent + '.' : '') + prop + ').to.exist.and.to.be.a(\'' + (type || 'string') + '\'); \n})`;



`pm.test(
  "It should have ' + prop + ' property", 
  function() {
    var jsonData = pm.response.json(); 
    return pm.expect(jsonData.' + (parent ? parent + '.' : '') + prop + ').to.exist.and.to.be.a((type || 'string') + '\'); 
})`;

