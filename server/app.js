// server/app.js
const express = require('express');
const morgan = require('morgan');
const path = require('path');
// const exec = require('child_process').exec;
// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser');
const {exec} = require('child_process');

const app = express();

// Setup logger
// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));

// Serve static assets
app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.use(bodyParser.json());

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  // res.send('GET request to the homepage');  
});

app.post('/build', function (req, res) {
  let modules = req.body.modules;
  // console.log('react post request req.params: ', req.params );
  // console.log('react post request req.body: ', req.body );
  // exec(`cd ../xt-edge && rm -rf ./out/_build/*  && ./node_modules/.bin/webpack --env.modules=${modules.join(',')}`);
  exec(`cd ../../xt-edge/ && ls -la && ./node_modules/.bin/webpack --env.modules=${modules.join(',')}`, (err, stdout, stderr) => {
    console.log('arg: ', stdout, stderr, err);
    console.log(`Build successful! webpack --env.modules=${modules.join(',')}`);
  });
  // console.log('react post request res: ', res);
  res.send('POST request to the homepage');
});

module.exports = app;
