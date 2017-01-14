// Configs
let config=require("config");
let widgetTypes=config.get("widgetTypes");
let data=require("../data/data.json");

// Global libraries and assets
const moment=require(`moment`);
const fs=require(`fs`);
const jQuery=$=require("../bower_components/jquery/dist/jquery.min.js");
const load=require("../js/resourceLoader.js");
const request=require(`request`);
require(`howler`);
load(`global.css`);
load(`../js/jquery.animateCss.js`);
load(`../bower_components/animate.css/animate.min.css`);
load(`../bower_components/font-awesome/css/font-awesome.min.css`);
load(`../bower_components/jquery-ui/jquery-ui.min.js`);
load(`../bower_components/jquery-ui-touch-punch/jquery.ui.touch-punch.min.js`);

// Electron integration 
const electron=require("electron");
const main=electron.remote.require("./server.js");
let ipcRenderer=electron.ipcRenderer;

// Main theming
load(`index.css`);
load(`theme-${data.theme}.css`);

$.get("splash.html",function(data){$("body").append(data)});
$.get("dashboard.html",function(data){$("body").append(data)});
$.get("notification.html",function(data){$("body").append(data)});
$.get("keypad.html",function(data){$("body").append(data)});

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
