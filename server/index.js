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

// var userID = [];
// var uniqueID = Math.random()*100007+1;
// names of available folder of xt-edge 
let xtArr = ['xt-edge1', 'xt-edge2', 'xt-edge3'];
let cookieID = {};

for (var i = 0; i < xtArr.length; i++) {
  cookieID[xtArr[i]] = {
    'occupied': false,
    'time': 0
  };
}

console.log(cookieID);

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
  var file = path.join(__dirname, '/../vendors/xt-edge/out/package.zip');
  res.download(file); // Set disposition and send it.
});

// Build
app.post('/build', function (req, res) {
  let modules = req.body.modules;
  let cookiesAtBrowser = req.cookies;
  let isAuthorised = false;
  let now, timeDiff, key;
  // cookie id and xt-edge copy same
  let folderName = '';


  // unoccupy all expired cookie
  Object.keys(cookieID).forEach(function (key) {
    // console.log('TimeNow',key,new Date().getTime());
    // console.log('Time Set',cookieID[key].time);
    timeDiff = new Date().getTime() - cookieID[key].time;
    if (timeDiff > 4 * 60 * 1000) {
      console.log('TimeOut ', key);
      cookieID[key].occupied = false;
    }
  })

  Object.keys(cookiesAtBrowser).forEach(function (key) {
    if (xtArr.indexOf(key) !== -1) {
      timeDiff = new Date().getTime() - cookiesAtBrowser[key];
      if (timeDiff < 4 * 60 * 1000) {
        isAuthorised = true;
        folderName = key;
        //cookieID[key].occupied = true;
        cookiesAtBrowser[key] = new Date().getTime();
        cookieID[key].time = cookiesAtBrowser[key];
      } else {
        //unoccupy it
        console.log('TimeDiff: ', timeDiff, ' TimeOut of ', key);
        isAuthorised = false;
        folderName = '';
        //cookieID[key].occupied = false;
      }
    }
  })


  if (isAuthorised) {
    //if already using or authorised user then update the time
    now = new Date().getTime();
    cookiesAtBrowser[folderName] = now;
    cookieID[folderName].time = now;
    console.log('Authorised');
  } else {
    //find empty cookie
    console.log('UnAuthorised');
    for (key in cookieID) {
      console.log(cookieID);
      if (cookieID[key].occupied === false) {
        now = new Date().getTime();
        //console.log(key,cookieID[key].occupied);
        cookieID[key].time = now;
        cookieID[key].occupied = true;
        //console.log(cookieID);
        folderName = key;
        res.cookie(key, now);
        break;
      }
      //else all occupied then wait
    }

  }
  console.log(folderName);
  // var index = 0;
  // for(index = 0;index < userID.length; index++) {
  //   if(uniqueID === userID[index]) {
  //     break;
  //   }
  // }
  // console.log(index);
  // var xtedge = 'xt-edge';
  // if(index>0) {
  //   var xtedge = xtedge+index;
  // }

  // if all occupied then create a new copy
  if (folderName === '') {
    var numOfcopy = xtArr.length + 1;
    xtArr.push('xt-edge' + numOfcopy);
    folderName = xtArr[xtArr.length - 1];
    console.log("New Folder: ", folderName);
    exec(`bash create-new ${modules.join(',')} ${folderName}`, (err, stdout, stderr) => {
      if (err !== null) {
        console.log('exec error: ' + err);
      }
      console.log(`Build successful! webpack --env.modules=${modules.join(',')}`);
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      console.log('POST request to the homepage' + ip);
      var file = path.join(__dirname, '/../vendors/' + folderName + '/out/package.zip');
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
const HOST = process.env.HOST || '192.168.0.190';

app.listen(PORT, HOST);

console.log(`App listening on http://${HOST}:${PORT}`);