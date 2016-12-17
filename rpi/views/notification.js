const queryString = require('query-string');
const jQuery=$=require("../bower_components/jquery/dist/jquery.min.js");
const load = require('../js/resourceLoader.js');
const data = queryString.parse(location.search);
const delay = data.delay || 9000;

load(`notification-${data.style}.css`);

window.onload=function(){
    document.getElementById("msg").innerHTML=data.msg;
    //document.getElementById("debug").innerHTML=JSON.stringify(data);
    setTimeout(()=>{this.close()},delay);
};
