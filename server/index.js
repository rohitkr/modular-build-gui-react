const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser');
var http = require('http');
const app = express();

// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length] :response-time ms'));
// app.use(express.static(path.resolve(__dirname, '..', 'build')));
app.use(bodyParser.json());

app.all('*', function(req, res, next) {
  let file = req.params[0];
  file = file == '/' ? 'index.html' : file;
  file = path.join(__dirname, '..', 'build', file);
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    next();
  }
});

// About
app.get('/about', function(req, res) {
  res.end('Welcome to the about page!');
});

// Download
app.get('/download', function(req, res) {
  var file = path.join(__dirname, '/../vendors/xt-edge/out/package.zip');
  res.download(file); // Set disposition and send it.
});

// Build
app.post('/build', function (req, res) {
  let modules = req.body.modules;
  exec(`bash create-build ${modules.join(',')}`, (err, stdout, stderr) => {
    console.log(`Build successful! webpack --env.modules=${modules.join(',')}`);
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log('POST request to the homepage' + ip);
    var file = path.join(__dirname, '/../vendors/xt-edge/out/package.zip');
    // res.download(file); // Set disposition and send it.
    res.send('POST request to the homepage' + ip);
  });
});

// 404, If path does not exist
app.get('*', function(req, res) {
  res.end('404! not found: ' + req.params[0]);
});

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
