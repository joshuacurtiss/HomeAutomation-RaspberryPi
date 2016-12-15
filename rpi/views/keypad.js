let jQuery=$=require("jquery");
$(document).ready(function(){
    $(".keypad button").click(handleKeypadClick);
    $(".keypad").submit(handleKeypadSubmit);
});
function handleKeypadClick(){
    var $passcodedots=$(".passcodeui i");
    // Determine the new value of the passcode based on button pressed
    var passcode=$("#passcode").val();
    if( this.value=="clear" ) {
        passcode="";
    } else if( this.value=="delete" ) {
        passcode=passcode.slice(0,-1);
    } else if( passcode.length<$passcodedots.length ) {
        passcode+=this.value;
    }
    $("#passcode").val(passcode);
    // Update passcode ui
    $passcodedots.removeClass("fa-circle-thin fa-circle");
    $passcodedots.each(function(key,obj){
        $(obj).addClass( (key<passcode.length)?"fa-circle":"fa-circle-thin" );
    });
    // Submit if passcode is full
    if( passcode.length==$passcodedots.length ) $(this).parent("form").submit();
}
function handleKeypadSubmit(){
    var passcode=$("#passcode").val();
    setTimeout(function(){alert(passcode)},200);
    return false;
}
