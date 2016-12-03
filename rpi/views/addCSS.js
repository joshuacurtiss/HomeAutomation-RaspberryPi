function addCSS(fn) {
    var head = document.head;
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = fn;
    head.appendChild(link);
}
module.exports=addCSS;