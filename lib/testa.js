const parseGoog = require('./parse-location-google.js');

let test1 = 'code fellows';
let test2 = 'dfkmkdj kfmkdjfdk';

parseGoog(test1)
.then( res => {
  console.log(test1, res);
})
.catch(console.error);

parseGoog(test2)
.then( res => {
  console.log(test2, res);
})
.catch(console.error);
