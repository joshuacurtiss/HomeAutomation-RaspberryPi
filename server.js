var exec = require("child_process").exec;
var express = require('express')
var app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.text());

const port=31415;
const chimeDir="/home/pi/Music/chimes/";
const audioPlayer="omxplayer";
const speechPlayer="./googlespeech.sh";
const sp=" ";

app.use(function(req,res,next){
  var d=new Date().toLocaleString();
  console.log(d + ": " + req.method + " " + req.url + (req.body.length>0?"\n":"") + req.body);
  next();
});

app.get('/', function (req, res) {
  res.send('Hello!')
})

app.post('/message', function (req, res) {
  try {
    var data=JSON.parse(req.body);
    chimeThenSpeak("tos_chirp.mp3",data.message.slice(6));
  }
  catch(err){console.log("Error. "+JSON.stringify(err));}
  res.send('Thanks for your message! ' + req.body);
})

app.post('/openclosesensor', function (req, res) {
  try {
    var data=JSON.parse(req.body);
    chimeAndSpeak("door-entry.mp3",data.device);
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
  exec(audioPlayer+sp+chimeDir+chime, function(error,stdout,stderr){speak(txt);});
}

function chimeAndSpeak(chime,txt)
{
  console.log("Play chime "+chime);
  exec(audioPlayer+sp+chimeDir+chime);
  setTimeout(function(){speak(txt)},250);
}

function speak(txt)
{
  console.log("Speak: "+txt);
  exec(speechPlayer+sp+txt);
}
