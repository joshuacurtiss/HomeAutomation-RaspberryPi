load(`splash.css`);

function runSplash(cb){
    $(".splash img")
        .removeClass("hidden")
        .animateCss("flipInY",()=>{
            $(".splash img").animate({
                "margin-top": "-=50px"
            }, 600);
            $(".splash h1")
                .removeClass("hidden")
                .animateCss("fadeInUp",cb);
        });
}

function endSplash(cb){
    $(".splash").animateCss("flipOutX",()=>{
        $(".splash").remove();
        if(cb)cb();
    });
}