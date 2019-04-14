var http = require("http");
var fs = require("fs");
var url = require("url"); // 모듈 url

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query; // url의 query string을 파싱
  var title = queryData.id;
  if (_url == "/") {
    title = "Welcome"; // root 경로로 접속했을 때, title을 Welcome으로 할 거임
  }
  if (_url == "/favicon.ico") {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200);
  fs.readFile(`data/${title}`, "utf8", function(err, description) {
    var template = `
      <!doctype html>
      <html>
      <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">WEB</a></h1>
        <ul>
          <li><a href="/?id=HTML">HTML</a></li>
          <li><a href="/?id=CSS">CSS</a></li>
          <li><a href="/?id=JavaScript">JavaScript</a></li>
        </ul>
        <h2>${title}</h2>
        <p>${description}</p> 
      </body>
      </html>
      `; // data 폴더에 있는 파일 내용을 본문에 삽입
    response.end(template);
  });
});
app.listen(3000);
