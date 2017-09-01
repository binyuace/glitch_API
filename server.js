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
app.use(bodyParser.json())
// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/dreams", function (request, response) {
  response.send(dreams);
});
// could also use the POST body instead of query string: http://expressjs.com/en/api.html#req.body
app.post("/dreams", function (request, response) {
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
    res.send(setTime(req.query.time))
  }
})
// parser API
app.get("/parser",(req,res)=>{
  res.send(parser(req,res))
})
app.get("/shorturl",(req,res)=>{
  res.sendFile(__dirname + '/views/short.html')
})
  
// shorten url API
var url = require('./db').url
var urlCount = 0
log('connecting to database')
MongoClient.connect(url, function(err, db) {
  if (err) console.error(err)
  else {
    log('Connected to database')
    let short = db.collection('shortenUrl')
     // Insert a bunch of documents for the testing
    // test.insertMany([], {w:1}, function(err, result) {
    //   if (err) console.error(err)
    app.get("/short/:url",(req,res)=>{
      short.findOne({shortUrl:'https://amazingbin.glitch.me/short/'+req.params.url},(err,result)=>{
        log('Get'+req.params.url)
        if (err){
          console.error(err)
          res.send('404 not found')
        }
        res.redirect(result.url)
      })
    })
    app.post("/short",(req,res)=>{
        const url = req.body.url
        log(req.body)
        short.find({}).toArray((err,result)=>{
          urlCount = result.length 
          const toInsert = require('./convert')(url,urlCount)
          if (toInsert.url === null) {
            res.send('url not valid')
          } else {
              res.send(toInsert)
              short.insertOne(toInsert,(err,result)=>{
                  if (err) console.error(err)
                  else {
                    log(result)
                    log('successfully inserted')
                  }
               })
          }
        })
        
    })
  }
  // image search API
  app.get("/search",(req,res)=>{
    var q = req.query.q
    if (q === undefined) {
      res.send(__dirname+'/views/im')
    } else {
 
      
      
      
      
    }
//   end of GET search
  })
  
  
//   end of database connection
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