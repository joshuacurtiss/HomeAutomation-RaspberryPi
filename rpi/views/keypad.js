const ALARMCOUNTDOWN=config.get("alarmCountdown");
const ALARMSOUND=config.get("alarmSound");
const KEYPADCOUNTDOWNSOUND=config.get("keypadCountdownSound");

var keypadTimer, 
    keypadCountdown, 
    keypadCountdownSound = new Howl({
        src: [KEYPADCOUNTDOWNSOUND],
        volume: 0.7,
        loop: true
    }), 
    alarmSound = new Howl({
        src: [ALARMSOUND],
        loop: true
    });

load(`keypad.css`);

ipcRenderer.on('intrusion-update', (event, data) => {
    checkIntrusion(data);
})

$(document).ready(function(){
    // Draw the passcode dots
    var passcodeLength=data.passcodeLength || 4;
    for( var i=0 ; i<passcodeLength ; i++ ) $(".passcodeui").append('<i class="fa fa-circle-thin"></i>');
    // Check initial intrusion status
    $.ajax({
        url: data.smartthings.url+"shm/intrusion",
        dataType: 'json',
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        cache: false,
        beforeSend: function (xhr) {xhr.setRequestHeader("Authorization", "Bearer " + data.smartthings.token)},
        success: checkIntrusion
    });
    // Wire up keypad handlers
    $(window).keypress(handleKeypress);
    $(".keypad button").click(handleKeypadClick);
    $(".keypad").submit(handleKeypadSubmit);
});
function checkIntrusion(data) {
    var mode=data.value||"off";
    var curval=$(".keypad").attr("data-value");
    if( mode=="on" && mode!=curval ) activateKeypad();
    else if( mode=="off" && mode!=curval ) deactivateKeypad();
}
function activateKeypad(){
    console.log("Activating keypad!");
    $(".keypad").attr("data-value","on").removeClass("hidden").animateCss("fadeInUpBig");
    keypadCountdown=ALARMCOUNTDOWN;
    updateKeypadCountdown();
    keypadCountdownSound.play();
}
function deactivateKeypad(){
    console.log("Deactivating keypad.");
    clearTimeout(keypadTimer);
    keypadCountdownSound.stop();
    alarmSound.stop();
    $(".keypad").attr("data-value","off").removeClass("alarm").animateCss("fadeOutDownBig",()=>{
        $(".keypad").addClass("hidden");
    });
}
function updateKeypadCountdown(){
    $(".keypad .countdown").html(keypadCountdown--);
    if( keypadCountdown>=0 ) keypadTimer=setTimeout(updateKeypadCountdown,999);
    else {
        activateAlarm();
        $(".keypad .countdown").html("");
    }
}
function activateAlarm(){
    console.log("Alarm!");
    $(".keypad").addClass("alarm");
    keypadCountdownSound.stop();
    alarmSound.play();
}
function handleKeypadClick(){
    addPasscodeDigit(this.value);
    this.blur();
}
function handleKeypress(event){
    addPasscodeDigit(event.key);
}
function handleKeypadSubmit(){
    var passcode=$("#passcode").val();
    var codedata=data.passcodes[passcode];
    $(".keypad button").prop("disabled",true);
    if( codedata ) {
        // If there is an action for this code, execute it:
        if( codedata.action ) $.get(codedata.action);
        // Turn off the intrusion notifiers:
        $.ajax({
            url: data.smartthings.url+"shm/intrusion",
            type: "POST",
            data: JSON.stringify({value:"off"}),
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            crossDomain: true,
            cache: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + data.smartthings.token);
            },
            complete: function (xhr) {
                updatePasscode("");
                $(".keypad button").prop("disabled",false);
            }
        });
    } else {
        $(".keypad").effect("shake",()=>{
            $(".keypad button").prop("disabled",false);
        });
        updatePasscode("");
    }
    return false;
}
function addPasscodeDigit(digit){
    var $passcodedots=$(".passcodeui i");
    // Determine the new value of the passcode based on button pressed
    var passcode=$("#passcode").val();
    if( digit=="clear" ) {
        passcode="";
    } else if( digit=="delete" ) {
        passcode=passcode.slice(0,-1);
    } else if( passcode.length<$passcodedots.length && digit>="0" && digit<="9" ) {
        passcode+=digit;
    }
    // Update passcode
    updatePasscode(passcode);
    // Submit if passcode is full
    if( passcode.length==$passcodedots.length ) $(".keypad").submit();
}
function updatePasscode(passcode){
    $("#passcode").val(passcode);
    $(".passcodeui i")
        .removeClass("fa-circle-thin fa-circle")
        .each(function(key,obj){
            $(obj).addClass( (key<passcode.length)?"fa-circle":"fa-circle-thin" );
        });
}
