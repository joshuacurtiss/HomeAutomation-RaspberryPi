// A jQuery extension to use the animate.css library by doing $(selector).animateCSs("effect")
$.fn.extend({
    animateCss: function (animationName,cb) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
            if(cb) cb();
        });
    }
});
