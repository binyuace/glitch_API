// server.js
// where your node app starts
require('es6-promise').polyfill();
require('isomorphic-fetch');
var log = console.log.bind(console)
// init project
var express = require('express');
var app = express();
var moment = require('moment')
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')

var Unsplash = require('unsplash-js').default;
var toJson = require('unsplash-js').toJson

const unsplash = new Unsplash({
  applicationId: "852842363511fc7d26839c600217bc1ca18cd2fa30af382631414c56ade47abb",
  secret: "be47b1024adf5b948438aa185146994ede0809800fb43bf8ec517b12aba67e58",
  callbackUrl: "urn:ietf:wg:oauth:2.0:oob"
});
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
    let search = db.collection('search')
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

    // image search API
    app.get("/search",(req,res)=>{
      var q = req.query.q
      var offset = req.query.offset?req.query.offset:10
      if (q === undefined) {
        res.sendFile(__dirname+'/views/imgsearch.html')
      } else { 
        log('searching '+q)

         unsplash.search.photos(q,1,offset) 
           .then(toJson)
            .then(json => {
                log('get '+json.results.length+' photos')
                  log('searching')
                 // res.json(json)
                 res.json(formatImage(json.results))
            });
        var time = new Date()
        search.insertOne({time:time,query:q},(err,result)=>{
          if (err) console.error(err)
          else log(result.ops)
        })

      }
//   end of GET search      
  })
    app.get("/latest",(req,res)=>{
      log('latest search')
      search.find({}).toArray((err,result)=>{
        if (err) console.error(err)
        log(result)
        result.sort((pre,cur)=>cur.time-pre.time)
        res.send(result.slice(0,10))
      })
  })
  }
  
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
function formatImage(result){
  return result.map((arr)=>{
    return {raw:arr.urls.raw,
    link:arr.links.html}
  })
}