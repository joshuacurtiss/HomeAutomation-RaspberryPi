const electron = require("electron");
var fs = require('fs');
var request = require('request');
var player = require('play-sound')(opts={});
var config = require("config");
var exec = require("child_process").exec;
var express = require('express')
var app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var port=config.get("port");
var chimes=config.get("chimes");
const q='"';

electron.app.on("ready", () => {
    let win=new electron.BrowserWindow(config.get("startWindowOptions"));
    win.loadURL(`file://${__dirname}${config.get("startWindowFile")}`);
});

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
    var data=req.body;
    chimeThenSpeak(chimes.message,data.message.slice(6));
  }
  catch(err){console.log("Error. "+err)}
  res.send('Thanks for your message! ' + req.body);
})

app.get('/api/notification/shm/:mode', function (req, res) {
  var mode=req.params.mode;
  console.log("Smart Home Monitor set to "+mode+".");
  res.send("Smart Home Monitor: "+mode+".");
})

app.get('/api/notification/intrusion/:mode', function (req, res) {
  var mode=req.params.mode;
  console.log("Intrusion status is "+mode+".");
  res.send("Intrusion status: "+mode+".");
})

app.post('/api/notification/:type', function (req, res) {
  var type=req.params.type;
  try {
    var data=req.body;
    if( type=="openclosesensor" ) {
      // TODO: May still have to call `xscreensaver-command -deactivate`?
      if( data.action=="open" ) // "open" or "closed"
      {
        let win=new electron.BrowserWindow({width:800, height:480, show:false});
        win.on('ready-to-show', function() {
            win.setFullScreen(true);
            win.show();
            win.focus();
        });
        win.loadURL(`file://${__dirname}/views/notification.html?msg=${data.device}&style=contact`);
        chimeThenSpeak(chimes.openclosesensor,data.device);
      } 
    } else if( type=="presence" ) {
      chimeThenSpeak(chimes.presence,data.device+" has "+data.action);
    } else if( type=="test" ) {
      chimeThenSpeak(chimes.openclosesensor,data.device);
    }
  }
  catch(err){console.log("Error. "+err)}
  res.send('Notification: ' + type + " " + req.body);
})

app.listen(port, function () {
  console.log('Listening on port '+port+'!')
})

function chimeThenSpeak(chime,txt)
{
  console.log("Play chime "+chime);
  player.play(chime,function(err){speak(txt)});
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
  fs.access(path, function(err){
    if(err) downloadSpeech(ttsUrl+txt, path, function(){player.play(path)});
    else player.play(path);
  });
}
