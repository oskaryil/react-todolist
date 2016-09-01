var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var moment = require('moment');
var db = mongoose.connection;

var app = express();

var TODOLIST_FILE = path.join(__dirname, 'todoListItems.json');

app.set('port', (process.env.PORT || 8080));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Additional middleware which will set headers that we need on each request.
app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/api/comments', function(req, res) {
  fs.readFile(TODOLIST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    res.json(JSON.parse(data));
  });
});

app.post('/api/comments', function(req, res) {
  fs.readFile(TODOLIST_FILE, function(err, data) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    var todoListItems = JSON.parse(data);
    // NOTE: In a real implementation, we would likely rely on a database or
    // some other approach (e.g. UUIDs) to ensure a globally unique id. We'll
    // treat Date.now() as unique-enough for our purposes.
    var newItem = {
      id: Date.now(),
      date: moment().format("MMM Do YY"),
      text: req.body.text,
      checked: false
    };
    todoListItems.push(newItem);
    fs.writeFile(TODOLIST_FILE, JSON.stringify(todoListItems, null, 4), function(err) {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      res.json(todoListItems);
    });
  });
});


app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
