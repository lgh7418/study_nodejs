var fs = require("fs");

// readFileSync 동기식으로 실행(코드 순서대로)
// C:\workspace\nodejs> node syntax/sync.js
console.log("A");
var result = fs.readFileSync("syntax/sample.txt", "utf8");
console.log(result);
console.log("C");

// 비동기
console.log("A");
var result = fs.readFile("syntax/sample.txt", "utf8", function(err, result) {
  console.log(result);
});
console.log("C");
