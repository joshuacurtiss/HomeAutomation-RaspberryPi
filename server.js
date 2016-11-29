var fs = require('fs');
var request = require('request');
var player = require('play-sound')(opts={});
var config = require("config");
var exec = require("child_process").exec;
var express = require('express')
var app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.text());

var port=config.get("port");
var chimes=config.get("chimes");
var dispPic=config.get("dispPic");
const q='"';

app.use(function(req,res,next){
  var d=new Date().toLocaleString();
  console.log(d + ": " + req.method + " " + req.url + (req.body.length>0?"\n":" ") + (typeof req.body=="object"?JSON.stringify(req.body):req.body));
  next();
});

app.get('/', function (req, res) {
  res.send('Hello!')
})

app.post('/api/message', function (req, res) {
  try {
    var data=JSON.parse(req.body);
    chimeThenSpeak(chimes.message,data.message.slice(6));
  }
  catch(err){console.log("Error. "+JSON.stringify(err));}
  res.send('Thanks for your message! ' + req.body);
})

app.get('/api/test', function (req, res) {
  exec(dispPic+" --message \"Testing Image!\" --img img/open-door.jpg",function(error,stdout,stderr){
    console.log("Executed Electron app. "+stdout+stderr);
  });
  res.send('Thanks for your message!!! ' + req.body);
})

app.post('/api/notification/:type', function (req, res) {
  var type=req.params.type;
  try {
    var data=JSON.parse(req.body);
    if( type=="openclosesensor" ) {
      exec(dispPic+" --message \""+data.device+"\" --img img/open-door.jpg");
      chimeThenSpeak(chimes.openclosesensor,data.device);
    } else if( type=="presence" ) {
      chimeThenSpeak(chimes.presence,data.device+" has "+data.action);
    }
  }
  catch(err){console.log("Error. "+JSON.stringify(err));}
  res.send('Notification: ' + type + " " + req.body);
})

app.listen(port, function () {
  console.log('Listening on port '+port+'!')
})

function chimeThenSpeak(chime,txt)
{
  console.log("Play chime "+chime);
  player.play(chime,(err)=>{speak(txt)});
}

/***** SPEECH *****/

function downloadSpeech(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log("Downloading "+res.headers['content-type']+" with length "+res.headers['content-length']+".");
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

function speak(txt)
{
  var ttsUrl=config.get("ttsUrl");
  var ttsCache=config.get("ttsCache");
  txt=txt.trim();
  console.log('Speak: '+q+txt+q);
  var filename=txt.toLowerCase().replace(/\W/g,"")+".mpg";
  var path=ttsCache+"/"+filename;
  fs.access(path, (err) => {
    if(err) downloadSpeech(ttsUrl+txt, path, ()=>{player.play(path)});
    else player.play(path);
  });
}
