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
var readline = require('readline');



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
app.get("/result/*", function (req, res) {

    var file = req.url;
    file = file.substring(file.lastIndexOf('/') +1, file.lastIndexOf('.'));


    var headerData = fs.readFileSync('/home/pi/cloud/result/' + file + '.header');
    headers = [];
    while( headerData.indexOf(' ') > -1 ) {
        while(headerData.substring(0,1) == ' ') {
            headerData = headerData.substring(1, headerData.length);
        }
        headers.push(headerData.substring(0, headerData.indexOf(' ')));
    }
    headers.push(headerData.substring(0, headerData.length));

    var html = '<body>\n' + file + '<table style="width:100%">\n<tr>\n'
    
    headers.forEach(
        header => html = html + '<th>' + header + '</th>'
    );

    html = html + '</tr>';
    
    var rd = readline.createInterface({
        input: fs.createReadStream('/home/pi/cloud/result/' + file + '.result'),
        output: process.stdout,
        console: false
    });
    rd.on('line', function(line) {
        html = html + '<tr>';
        jayZ = JSON.parse(line);
        headers.forEach(
            element => html = html + '<td>' + element + '</td>'
            );
        html = html + '</tr>';
    });
    
    html = html + '</table>';
    //const fileData = JSON.parse(fs.readFileSync(path.join(__dirname + filename)));
    const HTTP_PORT = CONFIG.HTTP_PORT;
    html = html + '</body>';

    res.send(html);
});


/** 
 * 404
 */
app.get("/*", function (req, res) {
const fs = require('fs');

    var html = '<body>\n';

    fs.readdirSync("/home/pi/cloud/results/").forEach(file => {
        console.log(file);
        html = html + '<a href="/result/' + file + '">' + file.substring(0, file.lastIndexOf('.')) + '</a><br>\n';
    });
    html = html + '</body>';
    res.send(html);
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
