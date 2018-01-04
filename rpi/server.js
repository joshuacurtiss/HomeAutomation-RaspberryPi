const electron = require("electron");
var config = require("config");
var os = require('os');
var exec = require("child_process").exec;
var express = require('express')
var app = express()

var bodyParser = require('body-parser');
app.use(bodyParser.json());

const port=config.get("port");
const widgetTypes=config.get("widgetTypes");
const q='"';

var win;

function deactivateScreensaver() {
  if( os.type()=="Linux" ) exec("xscreensaver-command -deactivate");
}

electron.app.on("ready", () => {
    win=new electron.BrowserWindow(config.get("startWindowOptions"));
    win.loadURL(`file://${__dirname}${config.get("startWindowFile")}`);
    if(config.get("startWindowDevTools")) win.webContents.openDevTools();
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
    win.webContents.send('notification', {
      chime:widgetTypes.message.chime || null,
      speak:data.message.slice(6)
    });
  }
  catch(err){console.log("Error. "+err)}
  res.send('Thanks for your message! ' + JSON.stringify(req.body));
})

app.post('/api/keypad', function (req, res) {
  var data=req.body;
  var code=data.code || "";
  win.webContents.send('keypad-update', data);
  console.log("Set keypad code to "+code+".");
  res.send("Setting keypad code.");
})

app.post('/api/shm', function (req, res) {
  var data=req.body;
  var mode=data.value; // "off", "stay", "away"
  win.webContents.send('shm-update', data);
  console.log("Smart Home Monitor set to "+mode+".");
  res.send("Smart Home Monitor: "+mode+".");
})

app.post('/api/intrusion', function (req, res) {
  var data=req.body;
  deactivateScreensaver();
  win.webContents.send('intrusion-update', data);
  console.log("Intrusion status is "+data.value+".");
  res.send("Intrusion status: "+data.value+".");
})

app.post('/api/:type', function (req, res) {
  var type=req.params.type;
  try {
    // Prep data
    var data=req.body;
    data.dt=new Date();
    data.comment=`${data.device.name} is ${data.value}.`;
    // Push update to dashboard
    win.webContents.send('device-update', data);
    // Handle notifications
    if( type=="contact" && data.value=="open" ) {
      deactivateScreensaver();
      win.webContents.send('notification', {
        screen:data.type,
        msg:data.device.name,
        chime:widgetTypes[data.device.device][`chime-${data.value}`] || null,
        speak:data.device.name
      });
    } else if( type=="presence" && data.value=="present" ) {
      win.webContents.send('notification', {
        chime:widgetTypes[data.device.device][`chime-${data.value}`] || null,
        speak:`${data.device.name} has arrived`
      });
    } else if( type=="test" ) {
      win.webContents.send('notification', {
        chime:widgetTypes[data.device.device][`chime-${data.value}`] || null,
        speak:`${data.device.name} is a test`
      });
    }
  }
  catch(err){console.log("Error. "+err)}
  res.send('Notification: ' + type + " " + JSON.stringify(req.body));
})

app.listen(port, function () {
  console.log('Listening on port '+port+'!')
})

exports.quit=()=>{
    electron.app.quit();
}