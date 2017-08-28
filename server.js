// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var moment = require('moment')
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
  console.log(request.query)
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
var dreams = [
  "Find and count some sheep",
  "Climb a really tall mountain",
  "Wash the dishes"
];
app.get("/timestamp",(req,res)=>{
  console.log(req.query)
  if (req.query.time == undefined){
    res.sendFile(__dirname + '/views/timestamp.html');
  }
  else {const timestamp = setTime(req.query.time)
    res.send(timestamp)
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