var http = require("http");
var fs = require("fs");
var url = require("url"); // 모듈 url
var qs = require("querystring");
var template = require("./lib/template.js");
var path = require("path");
var sanitizeHTML = require("sanitize-html"); // html 태그를 sanitize해줌
var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "opentutorials"
});
db.connect();

var app = http.createServer(function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query; // url의 query string을 파싱
  var pathname = url.parse(_url, true).pathname;
  if (pathname === "/") {
    if (queryData.id === undefined) {
      db.query("SELECT * FROM topic", function(error, topics) {
        var title = "Welcome";
        var description = "Hello, Node.js";
        var list = template.list(topics);
        var html = template.HTML(
          title,
          list,
          `<h2>${title}</h2><p>${description}</p> `,
          `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    } else {
      /* fs.readdir("./data", function(err, filelist) {
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
          var title = queryData.id;
          var sanitizedTitle = sanitizeHTML(title); // sanitize 된 것인지 변수명으로 설정하면 좋음
          var sanitizedDescription = sanitizeHTML(description, {
            allowedTags: ["h1"]
          });
          var list = template.list(filelist);
          var html = template.HTML(
            title,
            list,
            `<h2>${sanitizedTitle}</h2><p>${sanitizedDescription}</p> `,
            `<a href="/create">create</a> 
            <a href="/update?id=${sanitizedTitle}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${sanitizedTitle}">
              <input type="submit" value="delete">
            </form>` // delete는 링크로 하면 안됨
          );
          response.writeHead(200);
          response.end(html);
        });
      }); */
      db.query("SELECT * FROM topic", function(error, topics) {
        if (error) {
          throw error;
        }
        // `SELECT * FROM topic WHERE id=${queryData.id}` 이렇게 쓰면 사용자 입력값에 공격 당할 위험이 있음
        // ? 이용하면 queryData.id 값이 ?에 치환될 때 자동으로 세탁해줌
        db.query(`SELECT * FROM topic WHERE id=?`,[queryData.id], function(error2, topic) {
          if (error2) {
            throw error2;
          }
          var title = topic[0].title;
          var description = topic[0].description;
          var list = template.list(topics);
          var html = template.HTML(
            title,
            list,
            `<h2>${title}</h2><p>${description}</p> `,
            `
            <a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
            </form>
            `
          );
          response.writeHead(200);
          response.end(html);
        });
      });
    }
  } else if (pathname === "/create") {
    db.query("SELECT * FROM topic", function(error, topics) {
      var title = "WEB - create";
      var list = template.list(topics);
      var html = template.HTML(
        title,
        list,
        `
        <form action="/create_process" method="post">
          <p><input type="text" name="title" placeholder="title"></p>
          <p>
            <textarea name="description" placeholder="description"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
      `,
        ""
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname === "/create_process") {
    var body = "";
    // 웹브라우저가 post 방식으로 전송될 때,
    // 전송되는 데이터가 많을 경우 문제가 발생할 수 있기 때문에 호출할 때마다 데이터를 받을 수 있게 하는 함수
    request.on("data", function(data) {
      body = body + data;
    });
    // 더이상 전송할 데이터가 없으면 다음 함수를 실행
    request.on("end", function() {
      var post = qs.parse(body);
      db.query(`INSERT INTO topic (title, description, created, author_id) 
        VALUES(?, ?, NOW(), ?)`,
        [post.title, post.description, 1],
        function(error, result){
          if(error){
            throw error;
          }
          // id가 auto increment primary key인 경우, insert한 row의 id를 받아옴 => result.insertId
          response.writeHead(302, { Location: `/?id=${result.insertId}` });
          response.end();
        }
      )
    });
  } else if (pathname === "/update") {
    fs.readdir("./data", function(err, filelist) {
      var filteredId = path.parse(queryData.id).base;
      fs.readFile(`data/${filteredId}`, "utf8", function(err, description) {
        var title = queryData.id;
        var list = template.list(filelist);
        var html = template.HTML(
          title,
          list,
          `        
           <form action="/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
              <textarea name="description" placeholder="description">${description}</textarea>
            </p>
            <p>
              <input type="submit">
            </p>
          </form>`,
          `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
        );
        response.writeHead(200);
        response.end(html);
      });
    });
  } else if (pathname === "/update_process") {
    var body = "";
    request.on("data", function(data) {
      body = body + data;
    });
    request.on("end", function() {
      var post = qs.parse(body);
      console.log(post);
      var id = post.id;
      var title = post.title;
      var description = post.description;
      // title 수정 시 파일 이름 수정
      fs.rename(`data/${id}`, `data/${title}`, function(err) {
        fs.writeFile(`data/${title}`, description, "utf8", function(err) {
          response.writeHead(302, { Location: `/?id=${title}` });
          response.end();
        });
      });
    });
  } else if (pathname === "/delete_process") {
    var body = "";
    request.on("data", function(data) {
      body = body + data;
    });
    request.on("end", function() {
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(err) {
        response.writeHead(302, { Location: "/" }); // redirection의 코드 번호: 302
        response.end();
      });
    });
  } else {
    response.writeHead(404);
    response.end("Not found");
  }
});
app.listen(3000);
