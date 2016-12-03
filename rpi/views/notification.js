const queryString = require('query-string');
const addCSS = require('./addCSS.js');
window.onload=function(){
    const data = queryString.parse(location.search);
    const delay = data.delay || 9000;
    addCSS(`../css/${data.style}.css`);
    document.getElementById("msg").innerHTML=data.msg;
    //document.getElementById("debug").innerHTML=JSON.stringify(data);
    setTimeout(()=>{this.close()},delay);
};
