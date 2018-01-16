const CLOCK_TIMEFMT="h:mma";
const CLOCK_DATEFMT="dddd, MMMM D, YYYY";

var clockCountdown;

load(`clock.css`);

$(document).ready(function(){
    $(".clock").click(resetClockCountdown);
});

function activateClock(cb){
    $(".clock").show("fade");
    updateClock();
    if(cb) cb();
}
function deactivateClock(){
    if( $(".clock").is(":visible") ) {
        $(".clock").hide("fade");
    }
}
function updateClock()
{
    if( $(".clock").is(":visible") ) {
        var now=moment();
        $(".clock")
            .find("h1").html(now.format(CLOCK_DATEFMT)).end()
            .find("h2").html(now.format(CLOCK_TIMEFMT)).animateCss("rubberBand");
        var sec=now.seconds();
        setTimeout(updateClock,(60-sec)*1000);
    }
}
function resetClockCountdown(){
    deactivateClock();
    if( clockCountdown ) clearTimeout(clockCountdown);
    clockCountdown=setTimeout(activateClock,config.get('clockTimeout'));
}
