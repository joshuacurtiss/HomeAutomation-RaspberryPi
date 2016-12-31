const NOTIFICATIONDELAY=9999;

load(`notification-contact.css`);

ipcRenderer.on('notification', (event, data) => {
    activateNotification(data);
})

/* notification expects: {
        screen: The class of the div that should appear
        msg: The text that should appear on the screen 
        chime: The audio file that should play as a chime
        speak: The text that should be spoke after the chime
    } */
function activateNotification(settings) {
    if( settings.screen ) {
        $(`.notification.${settings.screen}`)
            .find(".msg").html(settings.msg || "").end()
            .removeClass("hidden").animateCss("fadeInUpBig");
        setTimeout(function(){
            $(`.notification.${settings.screen}`).animateCss("fadeOutDownBig",function(){
                $(`.notification.${settings.screen}`).addClass("hidden");
            })
        },NOTIFICATIONDELAY);
    }
    if( settings.chime && settings.speak ) {
        chime(settings.chime,()=>{speak(settings.speak)});
    } else if( settings.chime ) {
        chime(settings.chime);
    } else if( settings.speak ) {
        speak(settings.speak);
    }
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
    console.log(`Speak: "${txt}"`);
    var filename=txt.toLowerCase().replace(/\W/g,"")+".mp3";
    var path=ttsCache+"/"+filename;
    fs.access(path, function(err){
        if(err) downloadSpeech(ttsUrl+txt, path, ()=>{
            var h=new Howl({src:path});
            h.play();
        });
        else {
            var h=new Howl({src:path});
            h.play();
        }
    });
}

/***** CHIMES *****/

function chime(path,callback) {
    var ch=new Howl({src:path,onend:callback||null});
    ch.play();
    console.log(`Played chime ${path}`);
}