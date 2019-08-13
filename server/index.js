const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const exec = require('child_process').exec;
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
// parse urlencoded request bodies into req.body
var bodyParser = require('body-parser');
var http = require('http');
require('dotenv').config();
const app = express();

var passport = require('passport');
var Strategy = require('passport-local').Strategy;

const USER = 'admin';
const PASS = 'admin';
// 40 minutes
const TIMEOUT = 2400000;
// var userID = [];
// var uniqueID = Math.random()*100007+1;


// names of available folder of xt-edge 
// todo write it on json file use it as database and create .env file to set port and host
// let cookieID = {
//   'xt-edge1': {
//     occupied: false,
//     time: 0
//   },
//   'xt-edge2': {
//     occupied: false,
//     time: 0
//   },
//   'xt-edge3': {
//     occupied: false,
//     time: 0
//   }
// };

var cookieID = require(path.join(__dirname, '../xt-edge-storage.json'));
//start server with intial value
let folder;
for (folder in cookieID) {
  cookieID[folder].occupied = false;
  cookieID[folder].time = 0;
}

console.log(cookieID);

//encrypting the string
var encryptDecrypt = function (str) {
  var key = 2317893;
  var cryptStr = '';
  var xorValue;
  for (var i = 0; i < str.length; i++) {
    xorValue = str[i].charCodeAt(0) ^ key;
    cryptStr += String.fromCharCode(xorValue);
  }
  return cryptStr;
}
//  cookieID['xt-edge1'].occupied = true;
//  console.log('CookieID Obj:', cookieID,'Typeof:',typeof(cookieID),cookieID['xt-edge1']);


var obj = {
  id: 1,
  username: 'FusionCharts',
  password: 'admin',
  displayName: 'FusionCharts',
  emails: [{
    value: 'support@fusioncharts.com'
  }]
};

function verify(username, password) {
  return (username === USER && password === PASS) ? obj : false;
}
// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function (username, password, cb) {
    cb(null, verify(username, password));
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (id, cb) {
  cb(null, obj);
});

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
// app.use(require('morgan')('combined'));
app.use(cookieParser());
app.use(expressSession({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));

app.set('views', __dirname + '/');
app.set('view engine', 'ejs');

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// app.use(morgan(':remote-addr - :remote-user [:date[clf]] ':method :url HTTP/:http-version' :status :res[content-length] :response-time ms'));
// app.use(express.static(path.resolve(__dirname, '..', 'build')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Define routes.
app.get('*', function (req, res, next) {

  // Cookies that have not been signed
  // console.log('Cookies: ', req.cookies);

  // Set start time in browser cookie
  //res.cookie('START', +new Date());

  if (!req.user) {
    res.render('login', {
      user: req.user
    });
  } else {
    let file = req.params[0];
    file = file == '/' ? 'index.html' : file;
    file = path.join(__dirname, '..', 'build', file);
    if (fs.existsSync(file)) {
      res.sendFile(file);
    } else {
      next();
    }
  }
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login'
}), function (req, res) {
  // while(userID.indexOf(uniqueID) !== -1){
  //   uniqueID = Math.random()*100007+1;
  // }
  // userID.push(uniqueID);
  // res.cookie(uniqueID.toString(),'Modular Build');
  res.redirect('/');
});

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// About
app.get('/about', function (req, res) {
  res.end('Welcome to the about page!');
});

// Download
app.get('/download', function (req, res) {
  let cookiesAtBrowser = req.cookies;
  let folderName = '',
    timeDiff = 0,
    timeAtBrowser;

  console.log('\ndownloading...');
  timeAtBrowser = encryptDecrypt(cookiesAtBrowser.time);
  folderName = encryptDecrypt(cookiesAtBrowser.project);
  console.log('Folder Name : ', folderName, 'Time : ', timeAtBrowser);
  // adding timeout check for cookie, if timeout then no download
  if (folderName !== 'undefined') {
    timeDiff = new Date().getTime() - timeAtBrowser;

    if (timeDiff < TIMEOUT) {
      var file = path.join(__dirname, '/../vendors/' + folderName + '/out/package.zip');
      //var file = path.join(__dirname, '/../vendors/xt-edge/out/package.zip');
      console.log('To be Downloaded: ', file);
      res.download(file); // Set disposition and send it.
    } else {
      res.send('Download Copy Expired!!');
    }
  }
});

// Build
app.post('/build', function (req, res) {
  let modules = req.body.modules;
  let cookiesAtBrowser = req.cookies;
  let isAuthorised = false;
  let now, timeDiff, timeAtBrowser;
  // cookie id and xt-edge copy same
  let folderName = '';


  // unoccupy all expired cookie
  for (folder in cookieID) {
    // console.log('TimeNow',key,new Date().getTime());
    // console.log('Time Set',cookieID[key].time);
    timeDiff = new Date().getTime() - cookieID[folder].time;
    if (timeDiff > TIMEOUT) {
      console.log('TimeOut ', folder);
      cookieID[folder].occupied = false;
    }
  }

  // check whether user have valid cookie or not
  if (cookiesAtBrowser.project && cookiesAtBrowser.time) {
    folderName = encryptDecrypt(cookiesAtBrowser.project);
    timeAtBrowser = encryptDecrypt(cookiesAtBrowser.time);
  }

  if (typeof (cookieID[folderName]) !== 'undefined') {
    // now check for timeout
    timeDiff = new Date().getTime() - timeAtBrowser;
    if (cookieID[folderName].occupied === false || timeDiff > TIMEOUT) {
      isAuthorised = false;
    } else {
      isAuthorised = true;
    }
  }

  // use cookie as per the validation if browser already have cookie authorised continue using it
  // and extend its time else set new cookie
  if (isAuthorised) {
    //if already using or authorised user then update the time
    now = new Date().getTime();
    cookiesAtBrowser.time = encryptDecrypt(now.toString());
    cookieID[folderName].time = now;
    console.log('Authorised');
  } else {
    //find empty cookie
    console.log('UnAuthorised');
    // folderName empty
    folderName = '';
    for (folder in cookieID) {
      console.log(cookieID);
      if (cookieID[folder].occupied === false) {
        now = new Date().getTime();
        //console.log(key,cookieID[key].occupied);
        cookieID[folder].time = now;
        cookieID[folder].occupied = true;
        //console.log(cookieID);
        folderName = folder;
        // set cookie
        res.cookie('project', encryptDecrypt(folder));
        res.cookie('time', encryptDecrypt(now.toString()));
        break;
      }
      //else all cookie occupied , then folderName = '' 
    }

  }
  console.log(folderName);
  // if all occupied then create a new copy
  // testing if all occupied
  //folderName = '';
  if (folderName === '') {
    folderName = 'xt-edge-' + (Object.keys(cookieID).length + 1);
    now = new Date().getTime();
    cookieID[folderName] = {};
    cookieID[folderName].occupied = true;
    cookieID[folderName].time = now;
    // add it to file 
    fs.writeFile('./xt-edge-storage.json', JSON.stringify(cookieID), 'utf8', function (err) {
      if (err) throw err;
    })

    res.cookie('project', encryptDecrypt(folderName));
    res.cookie('time', encryptDecrypt(now.toString()));
    console.log("New Folder: ", folderName);

    exec(`bash create-new ${modules.join(',')} ${folderName}`, (err, stdout, stderr) => {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      console.log('Folder Name: ', folderName);
      console.log(`Build successful! webpack --env.modules=${modules.join(',')}`);
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log('POST request to the homepage' + ip);
      var file = path.join(__dirname, '/../vendors/' + folderName + '/out/package.zip');
      console.log('New file: ', file);
      // res.download(file); // Set disposition and send it.
      res.send('POST request to the homepage' + ip);
    });
  } else {
    exec(`bash create-build ${modules.join(',')} ${folderName}`, (err, stdout, stderr) => {
      console.log("FolderName: ", folderName);
      console.log(`Build successful! webpack --env.modules=${modules.join(',')}`);
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log('POST request to the homepage' + ip);
      var file = path.join(__dirname, '/../vendors/' + folderName + '/out/package.zip');
      console.log('File: ', file);
      // res.download(file); // Set disposition and send it.
      res.send('POST request to the homepage' + ip);
    });
  }
});

// 404, If path does not exist
app.get('*', function (req, res) {
  res.end('404! not found: ' + req.params[0]);
});

const PORT = process.env.PORT || 9000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST);

console.log(`App listening on http://${HOST}:${PORT}`);
