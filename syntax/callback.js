function _a() {
  console.log("A");
}

// javascript에서는 변수에 함수를 저장할 수 있음 -> 위의 함수와 같은 것!
var a = function() {
  console.log("A");
};

function slowfunc(callback) {
  callback();
}

// 파라미터로 함수가 저장된 변수를 넣으면
// slowfunc를 모두 실행한 후 callback이라는 함수를 실행하라는 의미
slowfunc(a);
