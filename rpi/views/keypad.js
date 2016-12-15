let jQuery=$=require("jquery");
let data=require("../data/data.json");
$(document).ready(function(){
    // Draw the passcode dots
    var passcodeLength=data.passcodeLength || 4;
    for( var i=0 ; i<passcodeLength ; i++ ) $(".passcodeui").append('<i class="fa fa-circle-thin"></i>');
    // Wire up keypad handlers
    $(window).keypress(handleKeypress);
    $(".keypad button").click(handleKeypadClick);
    $(".keypad").submit(handleKeypadSubmit);
});
function handleKeypadClick(){
    addPasscodeDigit(this.value);
}
function handleKeypress(event){
    addPasscodeDigit(event.key);
}
function handleKeypadSubmit(){
    var passcode=$("#passcode").val();
    var codedata=data.passcodes[passcode];
    if( codedata ) {
        alert(`Successful ${codedata.type} code named "${codedata.name}".`);
    } else {
        alert("NOPE!");
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
