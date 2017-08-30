// server.js
// where your node app starts
var log = console.log.bind(console)
// init project
var express = require('express');
var app = express();
var moment = require('moment')
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.
   
// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
// app.use(bodyParser.json())
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  log(request.body)
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});
// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
  log(request.body)
  dreams.push(request.query.dream); 
  response.sendStatus(200);
});
// Simple in-memory store for now
var dreams = []
// timestamp API
app.get("/timestamp",(req,res)=>{
  if (req.query.time == undefined){
    res.sendFile(__dirname + '/views/timestamp.html');
  }
  else {
    log(req.body)
    res.send(setTime(req.query.time))
  }
})
// parser API
app.get("/parser",(req,res)=>{
  res.send(parser(req,res))
})
// shorten url API
var url = require('./db').url
app.get("/short",(req,res)=>{
  
}) 
MongoClient.connect(url, function(err, db) {
  if (err) console.error(err)
  else {
    // log(db)

    var test = db.collection('test')
     // Insert a bunch of documents for the testing
    // test.insertMany([], {w:1}, function(err, result) {
    //   if (err) console.error(err)

    // Perform a simple find and return all the documents
      test.find({a:1}).toArray(function(err, docs) {
        log( docs); 
 
        db.close();  
      });
     // })
  }
})
 


 
 






 

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port: ' + listener.address().port);
});

function setTime(time){
  if (/^\d+/.test(time)){ 
    var unix = +time
    var natural= moment.unix(time).format("MMMM DD, YYYY")
  } else{
    var natural = time
    var unix = new Date(time).getTime()/1000
  }
  return {unix:unix,natural:natural}
}
function parser(req,res) {
  let user = req.get('user-agent')
  log(req.headers)
  var ip = req.headers['x-forwarded-for'].split(',')[0] || req.connection.remoteAddress;
  let software = user.match(/\(([^)]+)\)/)?user.match(/\(([^)]+)\)/)[1]:undefined;
  let language = (req.get('Accept-Language'))?req.get('Accept-Language').split(',')[0]:undefined;
  return {ip:ip,language:language,software:software}
}