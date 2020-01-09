/**
 * @overview Index file of hyperion webserver.
 * @author Marian Mehling <marian.mehling@th-wildau.de>
 * @version 0.4.0
 * @namespace index
 * @requires path
 * @requires fs
 * @requires https
 * @requires body-parser
 * @requires express
 */

// Loading required modules.
var path = require("path");
var fs = require('fs');
var http = require('http');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var cookieSession     = require('cookie-session');
var session = require('express-session');
var Express = require('express');
//var exphbs = require('express-handlebars');

const { exec } = require('child_process');

function runCom(command, callback) {
exec(command, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }
  callback(stdout);
  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});
}

const HTTP_PORT = 4000;

// -------------------- server init -----------------------------------
var app = Express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// cookie init
app.use(cookieParser('notsosecretkey')); // XXX
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    key: 'user_sid',
    secret: 'somerandonstuffs', // XXX
    resave: false,
    saveUninitialized: false,
    cookie: { expires: new Date(253402300799999) }
}));

app.use(Express.static('/home/pi/vsTest/static'));

// handlebars (template engine)
//app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
//app.set('view engine', 'handlebars');


app.listen(HTTP_PORT);

// http verbindungen werden immer auf https umgeleitet
//http.createServer(function (req, res) {
//    console.log("hyperion running at port " + HTTP_PORT);
//}, app).listen(HTTP_PORT);


function puts(error, stdout, stderr) { return stdout; }
//function puts(error, stdout, stderr) { sys.puts(stdout) }
//exec("ls -la", puts);

// -------------------- GET routes ------------------------------------


/** 
 * 404
 */
app.get("/fallback", function (req, res) {
    //res.send("404 alter, 404!");
    res.sendFile('/home/pi/vsTest/main.html')
});

/** 
 * 404
 */
app.get("/com", function (req, res) {
    //res.send("404 alter, 404!");
    res.sendFile('/home/pi/vsTest/main.html')
});


/** 
 * 404
 */
app.get("/*", function (req, res) {
const fs = require('fs');

    var names = "first";

    fs.readdirSync("/home/pi/cloud/results/").forEach(file => {
        console.log(file);
        name = name + "\n" + file;
    });
    res.send("dörte");
});


// -------------------- POST routes -----------------------------------


/**
 * DUMMY
 */
app.post('/commandTest', function (req, res) {
    if( req.body.password === "hyperhyper") {
        runCom(req.body.command, function (stdout) { res.send(stdout)});
    }
    else {
        console.log("wrong pw");
        res.send("404");
    }
});


/**
 * DUMMY
 */
app.post('/postDummy', function (req, res) {
    var subscription = req.body;
    engine.storeNotifyData(req.session.userID, subscription);
    res.status(201).json({});
});


// -------------------- functions -------------------------------------
