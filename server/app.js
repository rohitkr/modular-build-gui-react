/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var app = module.exports = express();

app.get('*', (req, res) => {
  console.log('* file: ', __dirname, ' : ', /download/.test(req.params[0]));

  var filePath = path.join(__dirname, '..', 'vendors', 'xt-edge', 'build.zip');

  if (/download/.test(req.params[0])) {
    res.download(filePath, function (err) {
      if (!err) return; // file sent
      if (err && err.status !== 404) return next(err); // non-404 error
      // file for download not found
      res.statusCode = 404;
      res.send('Cant find that file, sorry!');
    });    
  } else {
    res.sendFile(path.join(__dirname, '..', 'build', req.path));
  }
});

// app.get('/', function(req, res){
//   res.send('<ul>'
//     + '<li>Download <a href="/files/amazings.txt">amazing.txt</a>.</li>'
//     + '<li>Download <a href="/files/missing.txt">missing.txt</a>.</li>'
//     + '<li>Download <a href="/files/CCTV大赛上海分赛区.txt">CCTV大赛上海分赛区.txt</a>.</li>'
//     + '<li>Download <a href="/files/test.txt">test.txt</a>.</li>'
//     + '</ul>');
// });

// /files/* is accessed via req.params[0]
// but here we name it :file
// app.get('/files/:file(*)', function(req, res, next){
//   var filePath = path.join(__dirname, 'files', req.params.file);

//   res.download(filePath, function (err) {
//     if (!err) return; // file sent
//     if (err && err.status !== 404) return next(err); // non-404 error
//     // file for download not found
//     res.statusCode = 404;
//     res.send('Cant find that file, sorry!');
//   });
// });

/* istanbul ignore next */
if (!module.parent) {
  app.listen(3001);
  console.log('Express started on port 3001');
}



// // server/app.js
// const express = require('express');
// const morgan = require('morgan');
// const path = require('path');
// // const exec = require('child_process').exec;
// // parse urlencoded request bodies into req.body
// var bodyParser = require('body-parser');
// const {exec} = require('child_process');

// const app = express();

// // Setup logger
// // app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// // Serve static assets
// // app.use(express.static(path.resolve(__dirname, '..', 'build')));

// app.use(bodyParser.json());

// // Always return the main index.html, so react-router render the route in the client
// // /files/* is accessed via req.params[0]
// // but here we name it :file
// app.get('/download/:file(*)', function(req, res, next){
//   var filePath = path.join(__dirname, 'download', req.params.file);
  
//   console.log('download: ', filePath);

//   res.download(filePath, function (err) {
//     if (!err) return; // file sent
//     if (err && err.status !== 404) return next(err); // non-404 error
//     // file for download not found
//     res.statusCode = 404;
//     res.send('Cant find that file, sorry!');
//   });
// });

// app.get('/', function(req, res){
//   res.send('<ul>'
//     + '<li>Download <a href="/files/amazing.txt">amazing.txt</a>.</li>'
//     + '<li>Download <a href="/files/missing.txt">missing.txt</a>.</li>'
//     + '<li>Download <a href="/files/CCTV大赛上海分赛区.txt">CCTV大赛上海分赛区.txt</a>.</li>'
//     + '</ul>');
// });

// // app.get('*', (req, res) => {
// //   console.log('* file: ', path.join(__dirname, '..', 'build', req.path));
// //   res.sendFile(path.join(__dirname, '..', 'build', req.path));
// //   // res.send('GET request to the homepage');  
// // });

// // // Download
// // app.get('/download', function(req, res) {
// //   var file = path.join(__dirname, '..', 'vendors', 'xt-edge', 'build.zip');
// //   res.download(file);
// //   console.log('download file: ', file);
// // });


// // app.get('*', (req, res) => {
// //   console.log('* file: ', path.join(__dirname, '..', 'build', req.path));
// //   res.sendFile(path.join(__dirname, '..', 'build', req.path));
// //   // res.send('GET request to the homepage');  
// // });

// // // Build
// // app.post('/build', function (req, res) {
// //   let modules = req.body.modules;
// //   exec(`cd ./vendors/xt-edge/ && rm -rf ./out/_build/* && ls -la && ./node_modules/.bin/webpack --env.modules=${modules.join(',')} && zip build.zip out/_build`, (err, stdout, stderr) => {
// //     console.log(`Build successful! webpack --env.modules=${modules.join(',')}`);
// //   });
// //   res.send('POST request to the homepage');
// // });

// // // Download
// // app.get('/download', function (req, res) {
// //   let modules = req.body.modules;
// //   console.log('downloading the files...');
// //   var file = __dirname + '/../vendors/xt-edge/build.zip';
// //   console.log(file);
// //   res.download(file); // Set disposition and send it.
// // });

// module.exports = app;
