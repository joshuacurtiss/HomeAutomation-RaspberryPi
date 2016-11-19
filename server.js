var config = require("config");
var exec = require("child_process").exec;
var express = require('express')
var app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.text());

var port=config.get("port");
var chimes=config.get("chimes");
var audioPlayer=config.get("audioPlayer");
var ttsUrl=config.get("ttsUrl");
const sp=" ";
const q='"';

app.use(function(req,res,next){
  var d=new Date().toLocaleString();
  console.log(d + ": " + req.method + " " + req.url + (req.body.length>0?"\n":" ") + (typeof req.body=="object"?JSON.stringify(req.body):req.body));
  next();
});

app.get('/', function (req, res) {
  res.send('Hello!')
})

app.post('/message', function (req, res) {
  try {
    var data=JSON.parse(req.body);
    chimeThenSpeak(chimes.message,data.message.slice(6));
  }
  catch(err){console.log("Error. "+JSON.stringify(err));}
  res.send('Thanks for your message! ' + req.body);
})

app.post('/openclosesensor', function (req, res) {
  try {
    var data=JSON.parse(req.body);
    chimeAndSpeak(chimes.openclosesensor,data.device);
  }
  catch(err){console.log("Error. "+JSON.stringify(err));}
  res.send('Thanks for your message! ' + req.body);
})

app.post('/presence', function (req, res) {
  try {
    var data=JSON.parse(req.body);
    chimeThenSpeak(chimes.presence,data.device+" has "+data.action);
  }
  catch(err){console.log("Error. "+JSON.stringify(err));}
  res.send('Thanks for your message! ' + req.body);
})

app.listen(port, function () {
  console.log('Listening on port '+port+'!')
})

function chimeThenSpeak(chime,txt)
{
  console.log("Play chime "+chime);
  exec(audioPlayer+sp+chime, function(error,stdout,stderr){speak(txt);});
}

function chimeAndSpeak(chime,txt)
{
  console.log("Play chime "+chime);
  exec(audioPlayer+sp+chime);
  setTimeout(function(){speak(txt)},250);
}

function speak(txt)
{
  txt=txt.trim();
  console.log('Speak: '+q+txt+q);
  exec(audioPlayer+sp+q+ttsUrl+txt+q);
}
