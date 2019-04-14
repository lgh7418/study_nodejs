var http = require("http");
var fs = require("fs");
var url = require("url"); // 모듈 url

var app = http.createServer(function(request, response) {
  var _url = request.url;
  if (_url == "/") {
    _url = "/index.html";
  }
  if (_url == "/favicon.ico") {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200);
  console.log(__dirname + _url);
  response.end(fs.readFileSync(__dirname + _url));
});
app.listen(3000);
