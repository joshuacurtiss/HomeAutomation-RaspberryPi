// Configs
let config=require("config");
let data=require("../data/data.json");

// Global libraries and assets
let jQuery=$=require("../bower_components/jquery/dist/jquery.min.js");
let load=require("../js/resourceLoader.js");
load("../js/jquery.animateCss.js");
load(`global.css`);
load(`../bower_components/animate.css/animate.min.css`);
load(`../bower_components/font-awesome/css/font-awesome.min.css`);
require("../bower_components/jquery-ui/jquery-ui.min.js");

// Electron integration 
let electron=require("electron");
let ipcRenderer=electron.ipcRenderer;

// Main theming
load(`index.css`);
load(`theme-${data.theme}.css`);

$.get("splash.html",function(data){$("body").append(data)});
$.get("dashboard.html",function(data){$("body").append(data)});
$.get("notification.html",function(data){$("body").append(data)});

$(document).ready(function(){
    console.log("Hi! Welcome to Pi Guardian.");
    setTimeout(function(){
        runSplash(function(){
            initDashboard(function(){
                console.log("Dashboard initialized.");
                endSplash(revealDashboard);
            });
        });
    }, 300);
});
