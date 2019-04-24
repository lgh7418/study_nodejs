var mysql = require("mysql");
var db = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: ""
});
db.connect();
module.exports = db;
// 보안상 db.js를 바로 사용하지 않고 db.template.js를 만들어 사용
