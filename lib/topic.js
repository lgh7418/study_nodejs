var db = require("./db.js");
var template = require("./template.js");
var url = require("url");
var qs = require("querystring");

exports.home = function(request, response) {
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
};

exports.page = function(request, response) {
  db.query("SELECT * FROM topic", function(error, topics) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    if (error) {
      throw error;
    }
    db.query(
      `SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`,
      [queryData.id],
      function(error2, topic) {
        if (error2) {
          throw error2;
        }
        var title = topic[0].title;
        var description = topic[0].description;
        var list = template.list(topics);
        var html = template.HTML(
          title,
          list,
          `
              <h2>${title}</h2>
              <p>${description}</p>
              <p>by ${topic[0].name}</p>
              `,
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
      }
    );
  });
};

exports.create = function(request, response) {
  db.query("SELECT * FROM topic", function(error, topics) {
    db.query("SELECT * FROM author", function(error2, authors) {
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
                ${template.authorSelect(authors)}
              <p>
                <input type="submit">
              </p>
            </form>
            `,
        `<a href="/create">create</a>`
      );
      response.writeHead(200);
      response.end(html);
    });
  });
};

exports.create_process = function(request, response) {
  var body = "";
  // 웹브라우저가 post 방식으로 전송될 때,
  // 전송되는 데이터가 많을 경우 문제가 발생할 수 있기 때문에 호출할 때마다 데이터를 받을 수 있게 하는 함수
  request.on("data", function(data) {
    body = body + data;
  });
  // 더이상 전송할 데이터가 없으면 다음 함수를 실행
  request.on("end", function() {
    var post = qs.parse(body);
    db.query(
      `INSERT INTO topic (title, description, created, author_id) 
        VALUES(?, ?, NOW(), ?)`,
      [post.title, post.description, post.author],
      function(error, result) {
        if (error) {
          throw error;
        }
        // id가 auto increment primary key인 경우, insert한 row의 id를 받아옴 => result.insertId
        response.writeHead(302, { Location: `/?id=${result.insertId}` });
        response.end();
      }
    );
  });
};

exports.update = function(request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  db.query("SELECT * FROM topic", function(error, topics) {
    if (error) {
      throw error;
    }
    db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic) {
      if (error2) {
        throw error2;
      }
      db.query("SELECT * FROM author", function(error2, authors) {
        var list = template.list(topics);
        var html = template.HTML(
          topic[0].title,
          list,
          `        
             <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${topic[0].id}">
              <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
              <p>
                <textarea name="description" placeholder="description">${
                  topic[0].description
                }</textarea>
              </p>
              <p>
                ${template.authorSelect(authors, topic[0].author_id)}
              </p>
              <p>
                <input type="submit">
              </p>
            </form>`,
          `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
        ); // 나는 queryData.id를 썼는데 db에서 조회한 topic[0]으로 통일해주는 게 좋은 것 같음
        response.writeHead(200);
        response.end(html);
      });
    });
  });
};

exports.update_process = function(request, response) {
  var body = "";
  request.on("data", function(data) {
    body = body + data;
  });
  request.on("end", function() {
    var post = qs.parse(body);
    db.query(
      `UPDATE topic
        SET title=?, description=?, author_id=?
        WHERE id=?`,
      [post.title, post.description, post.author, post.id],
      function(error, result) {
        if (error) {
          throw error;
        }
        response.writeHead(302, { Location: `/?id=${post.id}` });
        response.end();
      }
    );
  });
};

exports.delete_process = function(request, response) {
  var body = "";
  request.on("data", function(data) {
    body = body + data;
  });
  request.on("end", function() {
    var post = qs.parse(body);
    db.query("DELETE FROM topic WHERE id = ?", [post.id], function(error, result) {
      if (error) {
        throw error;
      }
      response.writeHead(302, { Location: "/" }); // redirection의 코드 번호: 302
      response.end();
    });
  });
};
