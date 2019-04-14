var http = require("http");
var fs = require("fs");
var url = require("url"); // 모듈 url

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query; // url의 query string을 파싱
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      // root 경로 이고, query string이 없으면 ('http://localhost:3000/')
      fs.readFile(`data/${queryData.id}`, "utf8", function(err, description) {
        var title = "Welcome";
        var description = "Hello, Node.js";
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
        response.writeHead(200);
        response.end(template);
      });
    } else {
      // root 경로이고, query string이 있을 때 ('http://localhost:3000/?id=HTML')
      fs.readFile(`data/${queryData.id}`, "utf8", function(err, description) {
        var title = queryData.id;
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
        response.writeHead(200);
        response.end(template);
      });
    }
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
